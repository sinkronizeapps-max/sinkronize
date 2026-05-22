"""SINKRONIZE backend - App subscription marketplace + affiliate network."""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Cookie, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="SINKRONIZE API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("sinkronize")

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ============================ MODELS ============================
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Literal["producer", "affiliate", "both"] = "both"
    affiliate_tier: Literal["bronze", "prata", "ouro"] = "bronze"
    balance: float = 0.0
    created_at: datetime

class RegisterIn(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: Literal["producer", "affiliate", "both"] = "both"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class SessionIn(BaseModel):
    session_id: str

class AppProduct(BaseModel):
    app_id: str
    slug: str
    name: str
    tagline: str
    description: str
    category: str
    price_monthly: float
    commission_pct: float
    icon_url: Optional[str] = None
    cover_url: Optional[str] = None
    producer_id: str
    producer_name: str
    rating: float = 0.0
    reviews_count: int = 0
    subscribers: int = 0
    featured: bool = False
    created_at: datetime

class AppCreateIn(BaseModel):
    name: str
    tagline: str
    description: str
    category: str
    price_monthly: float
    commission_pct: float
    icon_url: Optional[str] = None
    cover_url: Optional[str] = None

class Affiliation(BaseModel):
    affiliation_id: str
    code: str
    app_id: str
    affiliate_id: str
    clicks: int = 0
    sales: int = 0
    earned: float = 0.0
    created_at: datetime

class Sale(BaseModel):
    sale_id: str
    app_id: str
    app_name: str
    buyer_email: str
    buyer_name: str
    amount: float
    producer_id: str
    affiliate_id: Optional[str] = None
    affiliation_code: Optional[str] = None
    producer_amount: float
    affiliate_amount: float
    platform_amount: float
    status: Literal["paid", "pending", "refunded"] = "paid"
    created_at: datetime

class ReviewIn(BaseModel):
    app_id: str
    rating: int
    comment: str

class Review(BaseModel):
    review_id: str
    app_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime

class Notification(BaseModel):
    notification_id: str
    user_id: str
    title: str
    message: str
    read: bool = False
    created_at: datetime

class WithdrawalIn(BaseModel):
    amount: float
    pix_key: str

class Withdrawal(BaseModel):
    withdrawal_id: str
    user_id: str
    amount: float
    pix_key: str
    status: Literal["pending", "approved", "paid"] = "pending"
    created_at: datetime

class CheckoutIn(BaseModel):
    app_id: str
    buyer_email: EmailStr
    buyer_name: str
    affiliation_code: Optional[str] = None
    card_number: str
    card_name: str

# ============================ HELPERS ============================
PLATFORM_FEE_PCT = 9.9  # SINKRONIZE platform fee

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False

def slugify(text: str) -> str:
    import re
    s = text.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_-]+', '-', s)
    return s.strip('-')

async def create_session(user_id: str) -> str:
    token = f"sk_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "session_token": token,
        "user_id": user_id,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return token

async def get_current_user(
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
) -> dict:
    token = session_token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    sess = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not sess:
        raise HTTPException(status_code=401, detail="Sessão inválida")
    expires_at = sess["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sessão expirada")
    user = await db.users.find_one({"user_id": sess["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    if isinstance(user.get("created_at"), str):
        user["created_at"] = datetime.fromisoformat(user["created_at"])
    return user

def set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session_token", value=token, max_age=7 * 24 * 60 * 60,
        httponly=True, secure=True, samesite="none", path="/",
    )

# ============================ AUTH ROUTES ============================
@api_router.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    existing = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": user_id,
        "email": payload.email.lower(),
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "picture": None,
        "role": payload.role,
        "affiliate_tier": "bronze",
        "balance": 0.0,
        "created_at": now.isoformat(),
    }
    await db.users.insert_one(doc)
    doc.pop("_id", None)
    token = await create_session(user_id)
    set_session_cookie(response, token)
    return {
        "user": {**{k: v for k, v in doc.items() if k != "password_hash"}, "created_at": now},
        "token": token,
    }

@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    user = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = await create_session(user["user_id"])
    set_session_cookie(response, token)
    safe = {k: v for k, v in user.items() if k != "password_hash"}
    if isinstance(safe.get("created_at"), str):
        safe["created_at"] = datetime.fromisoformat(safe["created_at"])
    return {"user": safe, "token": token}

@api_router.post("/auth/session")
async def auth_session(payload: SessionIn, response: Response):
    """Exchange Emergent session_id for our session token."""
    async with httpx.AsyncClient(timeout=20) as cli:
        r = await cli.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": payload.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Sessão Google inválida")
    data = r.json()
    email = data.get("email", "").lower()
    name = data.get("name", "Usuário")
    picture = data.get("picture")
    emergent_token = data.get("session_token")
    now = datetime.now(timezone.utc)

    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        doc = {
            "user_id": user_id, "email": email, "name": name,
            "password_hash": None, "picture": picture, "role": "both",
            "affiliate_tier": "bronze", "balance": 0.0,
            "created_at": now.isoformat(),
        }
        await db.users.insert_one(doc)
        user = doc
    else:
        await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"picture": picture, "name": name}})

    # Use Emergent's session_token directly so cookie matches their TTL
    token = emergent_token or await create_session(user["user_id"])
    await db.user_sessions.insert_one({
        "session_token": token,
        "user_id": user["user_id"],
        "expires_at": (now + timedelta(days=7)).isoformat(),
        "created_at": now.isoformat(),
    })
    set_session_cookie(response, token)
    safe = {k: v for k, v in user.items() if k != "password_hash"}
    if isinstance(safe.get("created_at"), str):
        safe["created_at"] = datetime.fromisoformat(safe["created_at"])
    return {"user": safe, "token": token}

@api_router.get("/auth/me")
async def auth_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(default=None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}

# ============================ APPS ROUTES ============================
@api_router.get("/apps")
async def list_apps(category: Optional[str] = None, q: Optional[str] = None, sort: str = "featured"):
    query = {}
    if category and category != "all":
        query["category"] = category
    if q:
        query["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"tagline": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    sort_field = {"featured": ("featured", -1), "rating": ("rating", -1), "new": ("created_at", -1), "commission": ("commission_pct", -1)}.get(sort, ("featured", -1))
    cursor = db.apps.find(query, {"_id": 0}).sort([sort_field, ("rating", -1)]).limit(200)
    items = await cursor.to_list(200)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return items

@api_router.get("/apps/categories")
async def list_categories():
    cats = await db.apps.distinct("category")
    counts = []
    for c in cats:
        n = await db.apps.count_documents({"category": c})
        counts.append({"name": c, "count": n})
    return counts

@api_router.get("/apps/{slug}")
async def get_app(slug: str):
    a = await db.apps.find_one({"slug": slug}, {"_id": 0})
    if not a:
        raise HTTPException(status_code=404, detail="App não encontrado")
    if isinstance(a.get("created_at"), str):
        a["created_at"] = datetime.fromisoformat(a["created_at"])
    return a

@api_router.post("/apps")
async def create_app(payload: AppCreateIn, user: dict = Depends(get_current_user)):
    app_id = f"app_{uuid.uuid4().hex[:10]}"
    slug = slugify(payload.name) + "-" + uuid.uuid4().hex[:4]
    now = datetime.now(timezone.utc)
    doc = {
        "app_id": app_id, "slug": slug, **payload.model_dump(),
        "producer_id": user["user_id"], "producer_name": user["name"],
        "rating": 0.0, "reviews_count": 0, "subscribers": 0, "featured": False,
        "created_at": now.isoformat(),
    }
    await db.apps.insert_one(doc)
    doc["created_at"] = now
    doc.pop("_id", None)
    return doc

@api_router.get("/my/apps")
async def my_apps(user: dict = Depends(get_current_user)):
    items = await db.apps.find({"producer_id": user["user_id"]}, {"_id": 0}).to_list(100)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return items

# ============================ AFFILIATIONS ============================
@api_router.post("/affiliations/{app_id}")
async def create_affiliation(app_id: str, user: dict = Depends(get_current_user)):
    a = await db.apps.find_one({"app_id": app_id}, {"_id": 0})
    if not a:
        raise HTTPException(status_code=404, detail="App não encontrado")
    existing = await db.affiliations.find_one({"app_id": app_id, "affiliate_id": user["user_id"]}, {"_id": 0})
    if existing:
        return existing
    aff_id = f"aff_{uuid.uuid4().hex[:10]}"
    code = uuid.uuid4().hex[:8].upper()
    now = datetime.now(timezone.utc)
    doc = {
        "affiliation_id": aff_id, "code": code, "app_id": app_id,
        "app_name": a["name"], "app_slug": a["slug"],
        "affiliate_id": user["user_id"], "clicks": 0, "sales": 0, "earned": 0.0,
        "created_at": now.isoformat(),
    }
    await db.affiliations.insert_one(doc)
    doc.pop("_id", None)
    return doc

@api_router.get("/my/affiliations")
async def my_affiliations(user: dict = Depends(get_current_user)):
    items = await db.affiliations.find({"affiliate_id": user["user_id"]}, {"_id": 0}).to_list(200)
    return items

@api_router.post("/track/{code}")
async def track_click(code: str):
    await db.affiliations.update_one({"code": code}, {"$inc": {"clicks": 1}})
    return {"ok": True}

# ============================ CHECKOUT / SALES ============================
@api_router.post("/checkout")
async def checkout(payload: CheckoutIn):
    """Simulated checkout - splits revenue between producer / affiliate / platform."""
    a = await db.apps.find_one({"app_id": payload.app_id}, {"_id": 0})
    if not a:
        raise HTTPException(status_code=404, detail="App não encontrado")
    amount = float(a["price_monthly"])
    commission_pct = float(a["commission_pct"])
    platform_amount = round(amount * PLATFORM_FEE_PCT / 100, 2)
    after_platform = amount - platform_amount

    affiliate_id = None
    affiliate_amount = 0.0
    if payload.affiliation_code:
        aff = await db.affiliations.find_one({"code": payload.affiliation_code}, {"_id": 0})
        if aff and aff["app_id"] == a["app_id"]:
            affiliate_id = aff["affiliate_id"]
            affiliate_amount = round(after_platform * commission_pct / 100, 2)

    producer_amount = round(after_platform - affiliate_amount, 2)

    sale_id = f"sale_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)
    sale = {
        "sale_id": sale_id, "app_id": a["app_id"], "app_name": a["name"],
        "buyer_email": payload.buyer_email.lower(), "buyer_name": payload.buyer_name,
        "amount": amount,
        "producer_id": a["producer_id"], "affiliate_id": affiliate_id,
        "affiliation_code": payload.affiliation_code,
        "producer_amount": producer_amount,
        "affiliate_amount": affiliate_amount,
        "platform_amount": platform_amount,
        "status": "paid",
        "created_at": now.isoformat(),
    }
    await db.sales.insert_one(sale)
    await db.apps.update_one({"app_id": a["app_id"]}, {"$inc": {"subscribers": 1}})
    await db.users.update_one({"user_id": a["producer_id"]}, {"$inc": {"balance": producer_amount}})
    await db.notifications.insert_one({
        "notification_id": f"ntf_{uuid.uuid4().hex[:10]}",
        "user_id": a["producer_id"],
        "title": "Nova venda!",
        "message": f"{payload.buyer_name} assinou {a['name']} (+R$ {producer_amount:.2f})",
        "read": False, "created_at": now.isoformat(),
    })
    if affiliate_id:
        await db.affiliations.update_one(
            {"code": payload.affiliation_code},
            {"$inc": {"sales": 1, "earned": affiliate_amount}},
        )
        await db.users.update_one({"user_id": affiliate_id}, {"$inc": {"balance": affiliate_amount}})
        await db.notifications.insert_one({
            "notification_id": f"ntf_{uuid.uuid4().hex[:10]}",
            "user_id": affiliate_id,
            "title": "Comissão recebida!",
            "message": f"Você ganhou R$ {affiliate_amount:.2f} com a venda de {a['name']}",
            "read": False, "created_at": now.isoformat(),
        })
        # Level up logic
        total_earned = await db.affiliations.aggregate([
            {"$match": {"affiliate_id": affiliate_id}},
            {"$group": {"_id": None, "sum": {"$sum": "$earned"}}},
        ]).to_list(1)
        if total_earned:
            t = total_earned[0]["sum"]
            tier = "bronze"
            if t >= 5000: tier = "ouro"
            elif t >= 1000: tier = "prata"
            await db.users.update_one({"user_id": affiliate_id}, {"$set": {"affiliate_tier": tier}})

    sale["created_at"] = now
    sale.pop("_id", None)
    return sale

@api_router.get("/my/sales")
async def my_sales(user: dict = Depends(get_current_user)):
    items = await db.sales.find({"producer_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    return items

@api_router.get("/my/commissions")
async def my_commissions(user: dict = Depends(get_current_user)):
    items = await db.sales.find({"affiliate_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    return items

# ============================ REVIEWS ============================
@api_router.post("/reviews")
async def add_review(payload: ReviewIn, user: dict = Depends(get_current_user)):
    rid = f"rev_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)
    doc = {
        "review_id": rid, "app_id": payload.app_id,
        "user_id": user["user_id"], "user_name": user["name"],
        "rating": payload.rating, "comment": payload.comment,
        "created_at": now.isoformat(),
    }
    await db.reviews.insert_one(doc)
    # recalc avg
    all_r = await db.reviews.find({"app_id": payload.app_id}, {"_id": 0, "rating": 1}).to_list(1000)
    avg = sum(r["rating"] for r in all_r) / len(all_r) if all_r else 0
    await db.apps.update_one({"app_id": payload.app_id}, {"$set": {"rating": round(avg, 1), "reviews_count": len(all_r)}})
    doc["created_at"] = now
    doc.pop("_id", None)
    return doc
@api_router.get("/reviews/{app_id}")
async def list_reviews(app_id: str):
    items = await db.reviews.find({"app_id": app_id}, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    return items

# ============================ NOTIFICATIONS ============================
@api_router.get("/notifications")
async def list_notifications(user: dict = Depends(get_current_user)):
    items = await db.notifications.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    return items

@api_router.post("/notifications/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)):
    await db.notifications.update_many({"user_id": user["user_id"]}, {"$set": {"read": True}})
    return {"ok": True}

# ============================ WALLET ============================
@api_router.get("/wallet")
async def get_wallet(user: dict = Depends(get_current_user)):
    withdrawals = await db.withdrawals.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).limit(50).to_list(50)
    fresh = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0, "password_hash": 0})
    return {"balance": fresh.get("balance", 0.0), "tier": fresh.get("affiliate_tier", "bronze"), "withdrawals": withdrawals}

@api_router.post("/wallet/withdraw")
async def request_withdrawal(payload: WithdrawalIn, user: dict = Depends(get_current_user)):
    fresh = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if payload.amount <= 0 or payload.amount > fresh.get("balance", 0):
        raise HTTPException(status_code=400, detail="Valor inválido ou saldo insuficiente")
    wid = f"wd_{uuid.uuid4().hex[:10]}"
    now = datetime.now(timezone.utc)
    doc = {
        "withdrawal_id": wid, "user_id": user["user_id"],
        "amount": payload.amount, "pix_key": payload.pix_key,
        "status": "pending", "created_at": now.isoformat(),
    }
    await db.withdrawals.insert_one(doc)
    doc.pop("_id", None)
    await db.users.update_one({"user_id": user["user_id"]}, {"$inc": {"balance": -payload.amount}})
    return {**doc, "created_at": now}

# ============================ STATS ============================
@api_router.get("/stats/producer")
async def producer_stats(user: dict = Depends(get_current_user)):
    sales = await db.sales.find({"producer_id": user["user_id"]}, {"_id": 0}).to_list(2000)
    total_revenue = sum(s["producer_amount"] for s in sales)
    total_sales = len(sales)
    apps_count = await db.apps.count_documents({"producer_id": user["user_id"]})
    last_30 = [s for s in sales if (datetime.fromisoformat(s["created_at"]) if isinstance(s["created_at"], str) else s["created_at"]) > datetime.now(timezone.utc) - timedelta(days=30)]
    # Sales by day for last 14 days
    series = {}
    for i in range(14):
        day = (datetime.now(timezone.utc) - timedelta(days=13 - i)).strftime("%d/%m")
        series[day] = 0
    for s in sales:
        d = datetime.fromisoformat(s["created_at"]) if isinstance(s["created_at"], str) else s["created_at"]
        if d > datetime.now(timezone.utc) - timedelta(days=14):
            key = d.strftime("%d/%m")
            if key in series:
                series[key] += s["producer_amount"]
    return {
        "total_revenue": round(total_revenue, 2),
        "total_sales": total_sales,
        "apps_count": apps_count,
        "revenue_30d": round(sum(s["producer_amount"] for s in last_30), 2),
        "chart": [{"day": k, "value": round(v, 2)} for k, v in series.items()],
    }

@api_router.get("/stats/affiliate")
async def affiliate_stats(user: dict = Depends(get_current_user)):
    sales = await db.sales.find({"affiliate_id": user["user_id"]}, {"_id": 0}).to_list(2000)
    aff = await db.affiliations.find({"affiliate_id": user["user_id"]}, {"_id": 0}).to_list(500)
    total_earned = sum(s["affiliate_amount"] for s in sales)
    total_clicks = sum(a.get("clicks", 0) for a in aff)
    conv = (len(sales) / total_clicks * 100) if total_clicks else 0
    series = {}
    for i in range(14):
        day = (datetime.now(timezone.utc) - timedelta(days=13 - i)).strftime("%d/%m")
        series[day] = 0
    for s in sales:
        d = datetime.fromisoformat(s["created_at"]) if isinstance(s["created_at"], str) else s["created_at"]
        if d > datetime.now(timezone.utc) - timedelta(days=14):
            key = d.strftime("%d/%m")
            if key in series:
                series[key] += s["affiliate_amount"]
    return {
        "total_earned": round(total_earned, 2),
        "total_sales": len(sales),
        "total_clicks": total_clicks,
        "conversion": round(conv, 2),
        "affiliations": len(aff),
        "chart": [{"day": k, "value": round(v, 2)} for k, v in series.items()],
    }

# ============================ MARKETING MATERIALS ============================
@api_router.get("/materials/{app_id}")
async def get_materials(app_id: str):
    a = await db.apps.find_one({"app_id": app_id}, {"_id": 0})
    if not a:
        raise HTTPException(status_code=404, detail="App não encontrado")
    return {
        "banners": [
            {"size": "1080x1080", "url": a.get("cover_url") or a.get("icon_url"), "label": "Quadrado (Instagram)"},
            {"size": "1200x630", "url": a.get("cover_url") or a.get("icon_url"), "label": "Open Graph (Facebook/X)"},
            {"size": "1920x1080", "url": a.get("cover_url") or a.get("icon_url"), "label": "Banner Wide (YouTube)"},
        ],
        "copy": [
            {"title": "Headline curta", "text": f"Descubra o {a['name']} — {a['tagline']}"},
            {"title": "Story de venda", "text": f"Eu testei o {a['name']} por 30 dias e mudou minha rotina. {a['tagline']}. Clique no link da bio."},
            {"title": "E-mail marketing", "text": f"Olá! Quero te apresentar uma ferramenta que está revolucionando: {a['name']}. {a['description'][:200]}..."},
        ],
        "hashtags": ["#sinkronize", f"#{slugify(a['name']).replace('-', '')}", f"#{slugify(a['category']).replace('-', '')}", "#afiliados", "#renda extra".replace(" ", "")],
    }

# ============================ SEED ============================
@app.on_event("startup")
async def seed_data():
    count = await db.apps.count_documents({})
    if count > 0:
        return
    logger.info("Seeding initial data...")
    now = datetime.now(timezone.utc)
    # Seed producer
    producer_id = "user_seed_prod01"
    await db.users.insert_one({
        "user_id": producer_id, "email": "producer@sinkronize.com", "name": "Studio Nova",
        "password_hash": hash_password("demo1234"), "picture": None, "role": "producer",
        "affiliate_tier": "ouro", "balance": 12480.50, "created_at": now.isoformat(),
    })
    affiliate_id = "user_seed_aff01"
    await db.users.insert_one({
        "user_id": affiliate_id, "email": "afiliado@sinkronize.com", "name": "Marina Costa",
        "password_hash": hash_password("demo1234"), "picture": None, "role": "affiliate",
        "affiliate_tier": "prata", "balance": 2340.10, "created_at": now.isoformat(),
    })
    apps_seed = [
        {"name": "Mente Calma", "tagline": "Meditação guiada por IA em 5 minutos", "category": "Bem-estar", "price": 29.90, "comm": 50, "icon": "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&q=80"},
        {"name": "FluxoPro", "tagline": "Produtividade para criadores que cobram caro", "category": "Produtividade", "price": 49.90, "comm": 40, "icon": "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80"},
        {"name": "TreinoIA", "tagline": "Personal trainer com IA no seu bolso", "category": "Fitness", "price": 39.90, "comm": 45, "icon": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80"},
        {"name": "Finanças Zen", "tagline": "Controle financeiro sem planilha", "category": "Finanças", "price": 19.90, "comm": 60, "icon": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80"},
        {"name": "ChefIA", "tagline": "Receitas com o que você tem na geladeira", "category": "Culinária", "price": 24.90, "comm": 55, "icon": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80"},
        {"name": "Idiomas Vivos", "tagline": "Aprenda 7 idiomas conversando", "category": "Educação", "price": 59.90, "comm": 35, "icon": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&q=80"},
        {"name": "Sono Profundo", "tagline": "Histórias e sons que te fazem dormir em 7 minutos", "category": "Bem-estar", "price": 14.90, "comm": 65, "icon": "https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400&q=80"},
        {"name": "Pet Saúde", "tagline": "App veterinário para tutores apaixonados", "category": "Pets", "price": 34.90, "comm": 50, "icon": "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&q=80"},
        {"name": "Vendedor 10x", "tagline": "Scripts e CRM para autônomos", "category": "Negócios", "price": 69.90, "comm": 40, "icon": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80"},
    ]
    for i, s in enumerate(apps_seed):
        app_id = f"app_seed{i:03d}"
        await db.apps.insert_one({
            "app_id": app_id, "slug": slugify(s["name"]) + f"-{i}",
            "name": s["name"], "tagline": s["tagline"],
            "description": f"{s['tagline']}. Uma experiência cuidadosamente desenhada para transformar seu dia a dia. Acesso ilimitado, atualizações constantes e suporte humano sempre que precisar. Junte-se a milhares de pessoas que já transformaram sua rotina com {s['name']}.",
            "category": s["category"],
            "price_monthly": s["price"], "commission_pct": s["comm"],
            "icon_url": s["icon"],
            "cover_url": s["icon"],
            "producer_id": producer_id, "producer_name": "Studio Nova",
            "rating": round(4.2 + (i % 8) * 0.1, 1), "reviews_count": 40 + i * 23,
            "subscribers": 1200 + i * 480, "featured": i < 4,
            "created_at": (now - timedelta(days=i * 3)).isoformat(),
        })
    logger.info("Seed completed.")

@api_router.get("/")
async def root():
    return {"app": "SINKRONIZE", "status": "ok"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
