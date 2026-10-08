# CRE8R — AI Creator Marketplace (MVP)

Marketplace connecting AI-native creators with brands and agencies. No AI/LLM APIs are used; search and filtering are deterministic.

```
Frontend/   Next.js 16 (App Router) · TypeScript · Tailwind 4 · Framer Motion · React Three Fiber · Lucide
Backend/    NestJS 11 · Mongoose 8 · JWT · class-validator · Cloudinary signed uploads
```

## Run

```bash
# 1. API  → http://localhost:4000/api
cd Backend
npm install
npm run build && npm start        # or: npm run start:dev

# 2. Web  → http://localhost:3000
cd Frontend
npm install
npm run dev                       # or: npm run build && npm start
```

If port 3000 is busy, run `npx next dev -p 3001` instead.

With no `MONGODB_URI`, the API runs **in memory** and is seeded automatically. With `MONGODB_URI` set, it connects to MongoDB and seeds empty collections on first boot. `npm run seed` resets the database and reloads the seed data.

If the API is unreachable, the frontend falls back to the bundled seed data (`Frontend/data/seed.ts`), so the demo still works.

Demo logins (password `password123`): `brand@cre8r.dev`, `creator@cre8r.dev`.

## Environment

`Backend/.env`

| Var | Purpose |
| --- | --- |
| `PORT` | API port (default 4000) |
| `MONGODB_URI` | MongoDB connection string. Leave empty to use in-memory mode. |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth tokens |
| `FRONTEND_URL` | CORS origin. Any `localhost` origin is also allowed. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Signed portfolio uploads (`POST /api/uploads/signature`) |

`Frontend/.env.local`

| Var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Default `http://localhost:4000/api` |

## Production deployment (Render, one repo)

`render.yaml` defines two web services that deploy from this repo:

| Service | Root directory | Build | Start |
| --- | --- | --- | --- |
| `cre8r-api` | `Backend` | `npm ci && npm run build` | `node dist/main.js` (health check `/api/health`) |
| `cre8r-web` | `Frontend` | `npm ci && npm run build` | `npm start` |

Steps:
1. Render dashboard → **New → Blueprint** → choose this repo → **Apply**.
2. When asked, fill in the secret values for `cre8r-api`: `MONGODB_URI`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Render generates `JWT_SECRET` for you.
3. In MongoDB Atlas → **Network Access**, allow `0.0.0.0/0`. Render's free plan has no fixed IP addresses.
4. The blueprint assumes these URLs: `https://cre8r-api.onrender.com` and `https://cre8r-web.onrender.com`. If Render gives either service a different URL, update both of these and redeploy:
   - `NEXT_PUBLIC_API_URL` on `cre8r-web`
   - `FRONTEND_URL` on `cre8r-api`

In production the API refuses to start if `JWT_SECRET` is weak or if `MONGODB_URI` or `FRONTEND_URL` is missing. CORS only allows `FRONTEND_URL`.

Docker alternative:

```bash
PUBLIC_API_URL=http://localhost:4000/api docker compose --env-file Backend/.env up --build
```

## Demo flow

Landing → **Explore Creators** → search "AI Filmmaker" → add the **Runway** filter → open **Aarav Mehta** → portfolio, tools, verification → **Invite to Brief** → fill in the form → **Publish Brief** → "Your brief is live." → **View on Briefs** (the new brief is listed first and highlighted).
