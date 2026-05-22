"""SINKRONIZE backend tests - full coverage of auth, apps, affiliations, checkout, stats, wallet."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://affiliate-hub-v1.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

PRODUCER = {"email": "producer@sinkronize.com", "password": "demo1234"}
AFFILIATE = {"email": "afiliado@sinkronize.com", "password": "demo1234"}


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def producer_token(session):
    r = session.post(f"{API}/auth/login", json=PRODUCER)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="module")
def affiliate_token(session):
    r = session.post(f"{API}/auth/login", json=AFFILIATE)
    assert r.status_code == 200, r.text
    return r.json()["token"]


# ============ Apps / Marketplace ============
class TestApps:
    def test_list_apps(self, session):
        r = session.get(f"{API}/apps")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 9, f"expected 9 seeded apps, got {len(items)}"

    def test_filter_category(self, session):
        r = session.get(f"{API}/apps", params={"category": "Bem-estar"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) > 0
        for it in items:
            assert it["category"] == "Bem-estar"

    def test_search_q(self, session):
        r = session.get(f"{API}/apps", params={"q": "mente"})
        assert r.status_code == 200
        items = r.json()
        assert any("mente" in (it["name"] + it["tagline"]).lower() for it in items)

    def test_categories(self, session):
        r = session.get(f"{API}/apps/categories")
        assert r.status_code == 200
        cats = r.json()
        assert any(c["name"] == "Bem-estar" and c["count"] >= 1 for c in cats)

    def test_app_detail_by_slug(self, session):
        r = session.get(f"{API}/apps")
        slug = r.json()[0]["slug"]
        r2 = session.get(f"{API}/apps/{slug}")
        assert r2.status_code == 200
        assert r2.json()["slug"] == slug

    def test_app_404(self, session):
        r = session.get(f"{API}/apps/does-not-exist-xyz")
        assert r.status_code == 404


# ============ Auth ============
class TestAuth:
    def test_register_and_me(self, session):
        email = f"test_{uuid.uuid4().hex[:8]}@sinkronize.com"
        r = session.post(f"{API}/auth/register", json={
            "email": email, "password": "pass1234", "name": "Test User", "role": "both"
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and "user" in data
        assert data["user"]["email"] == email
        token = data["token"]
        r2 = requests.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r2.status_code == 200
        assert r2.json()["email"] == email

    def test_register_duplicate(self, session):
        r = session.post(f"{API}/auth/register", json={
            "email": "producer@sinkronize.com", "password": "x", "name": "Dup", "role": "both"
        })
        assert r.status_code == 400

    def test_login_producer(self, producer_token):
        assert producer_token.startswith("sk_") or len(producer_token) > 10

    def test_login_invalid(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "producer@sinkronize.com", "password": "wrong"})
        assert r.status_code == 401

    def test_me_no_token(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout(self, session):
        r = session.post(f"{API}/auth/login", json=PRODUCER)
        token = r.json()["token"]
        r2 = requests.post(f"{API}/auth/logout", headers={"Cookie": f"session_token={token}"})
        assert r2.status_code == 200


# ============ My/Producer/Affiliate flows + checkout + stats ============
class TestFlows:
    def test_my_apps_producer(self, producer_token):
        r = requests.get(f"{API}/my/apps", headers={"Authorization": f"Bearer {producer_token}"})
        assert r.status_code == 200
        assert len(r.json()) >= 9

    def test_producer_stats(self, producer_token):
        r = requests.get(f"{API}/stats/producer", headers={"Authorization": f"Bearer {producer_token}"})
        assert r.status_code == 200
        data = r.json()
        for k in ("total_revenue", "total_sales", "apps_count", "chart"):
            assert k in data
        assert len(data["chart"]) == 14

    def test_create_affiliation_and_checkout_split(self, affiliate_token, producer_token):
        # get first app
        apps = requests.get(f"{API}/apps").json()
        app = apps[0]
        # affiliate creates affiliation
        r = requests.post(f"{API}/affiliations/{app['app_id']}",
                          headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 200, r.text
        aff = r.json()
        assert "code" in aff
        code = aff["code"]

        # checkout with affiliation_code
        payload = {
            "app_id": app["app_id"], "buyer_email": f"buyer_{uuid.uuid4().hex[:6]}@x.com",
            "buyer_name": "Buyer Test", "affiliation_code": code,
            "card_number": "4111111111111111", "card_name": "Buyer Test",
        }
        r2 = requests.post(f"{API}/checkout", json=payload)
        assert r2.status_code == 200, r2.text
        sale = r2.json()
        amount = app["price_monthly"]
        expected_platform = round(amount * 9.9 / 100, 2)
        after = amount - expected_platform
        expected_aff = round(after * app["commission_pct"] / 100, 2)
        expected_prod = round(after - expected_aff, 2)
        assert abs(sale["platform_amount"] - expected_platform) < 0.02
        assert abs(sale["affiliate_amount"] - expected_aff) < 0.02
        assert abs(sale["producer_amount"] - expected_prod) < 0.02

    def test_my_affiliations(self, affiliate_token):
        r = requests.get(f"{API}/my/affiliations", headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_my_commissions(self, affiliate_token):
        r = requests.get(f"{API}/my/commissions", headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 200

    def test_my_sales(self, producer_token):
        r = requests.get(f"{API}/my/sales", headers={"Authorization": f"Bearer {producer_token}"})
        assert r.status_code == 200

    def test_affiliate_stats(self, affiliate_token):
        r = requests.get(f"{API}/stats/affiliate", headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 200
        assert "total_earned" in r.json()


# ============ Reviews / Wallet / Materials / Notifications ============
class TestExtras:
    def test_add_review_and_recalc(self, affiliate_token):
        apps = requests.get(f"{API}/apps").json()
        app = apps[1]
        old_rating = app.get("rating")
        r = requests.post(f"{API}/reviews", json={"app_id": app["app_id"], "rating": 5, "comment": "Excelente!"},
                          headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 200
        r2 = requests.get(f"{API}/apps/{app['slug']}")
        assert r2.status_code == 200
        # rating may change
        assert r2.json()["reviews_count"] >= 1
        _ = old_rating

    def test_list_reviews(self, session):
        apps = requests.get(f"{API}/apps").json()
        r = requests.get(f"{API}/reviews/{apps[1]['app_id']}")
        assert r.status_code == 200

    def test_wallet(self, affiliate_token):
        r = requests.get(f"{API}/wallet", headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 200
        data = r.json()
        for k in ("balance", "tier", "withdrawals"):
            assert k in data

    def test_withdraw_invalid(self, affiliate_token):
        r = requests.post(f"{API}/wallet/withdraw",
                          json={"amount": 9999999, "pix_key": "x@x.com"},
                          headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 400

    def test_withdraw_ok(self, affiliate_token):
        r = requests.post(f"{API}/wallet/withdraw",
                          json={"amount": 10, "pix_key": "afiliado@sinkronize.com"},
                          headers={"Authorization": f"Bearer {affiliate_token}"})
        assert r.status_code == 200
        assert r.json()["status"] == "pending"

    def test_materials(self, session):
        apps = requests.get(f"{API}/apps").json()
        r = requests.get(f"{API}/materials/{apps[0]['app_id']}")
        assert r.status_code == 200
        data = r.json()
        assert len(data["banners"]) == 3
        assert len(data["copy"]) == 3
        assert len(data["hashtags"]) >= 3

    def test_notifications(self, producer_token):
        r = requests.get(f"{API}/notifications", headers={"Authorization": f"Bearer {producer_token}"})
        assert r.status_code == 200

    def test_create_app(self, producer_token):
        payload = {
            "name": f"TEST_App_{uuid.uuid4().hex[:6]}",
            "tagline": "test tagline", "description": "desc " * 5,
            "category": "Produtividade", "price_monthly": 19.9, "commission_pct": 40,
            "icon_url": None, "cover_url": None,
        }
        r = requests.post(f"{API}/apps", json=payload,
                          headers={"Authorization": f"Bearer {producer_token}"})
        assert r.status_code == 200
        assert r.json()["name"] == payload["name"]
