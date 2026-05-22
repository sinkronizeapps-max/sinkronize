# Auth Testing Playbook (for SINKRONIZE)

Auth model: dual flow
1) JWT email/password (custom backend) – returns `session_token` stored in DB + cookie.
2) Emergent Google Auth – `session_id` in URL fragment, backend exchanges for `session_token`.

Both flows produce the SAME `session_token` cookie pattern, stored in `user_sessions`.

Backend endpoints:
- POST /api/auth/register {email, password, name} -> {user, token}
- POST /api/auth/login {email, password} -> {user, token}
- POST /api/auth/session {session_id} (from Emergent) -> sets cookie, returns user
- GET  /api/auth/me  (cookie or Authorization: Bearer)
- POST /api/auth/logout

User schema:
- user_id (uuid string, custom)
- email, name, password_hash (nullable), picture, role ("producer"|"affiliate"|"both"), created_at
- All queries use {"_id": 0}

Session schema:
- session_token, user_id, expires_at (UTC), created_at

Testing:
```
curl -X POST $BACKEND/api/auth/register -H 'Content-Type: application/json' -d '{"email":"a@a.com","password":"123456","name":"A"}'
curl -X POST $BACKEND/api/auth/login -H 'Content-Type: application/json' -d '{"email":"a@a.com","password":"123456"}'
curl $BACKEND/api/auth/me -H "Authorization: Bearer <token>"
```
