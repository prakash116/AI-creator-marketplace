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

 defines two web services that deploy from this repo:

| Service | Root directory | Build | Start |
| --- | --- | --- | --- |
|  |  |  |  (health check ) |
|  |  |  | Unknown command: "start"


Did you mean one of these?
  npm star # Mark your favorite packages
  npm stars # View packages marked as favorites
  npm start # Start a package
To see a list of supported npm commands, run:
  npm help |

Steps:
1. Render dashboard → **New → Blueprint** → choose this repo → **Apply**.
2. When asked, fill in the secret values for : , , , . Render generates  for you.
3. In MongoDB Atlas → **Network Access**, allow . Render's free plan has no fixed IP addresses.
4. The blueprint assumes these URLs:  and . If Render gives either service a different URL, update both of these and redeploy:
   -  on    -  on 
In production the API refuses to start if  is weak or if  or  is missing. CORS only allows .

Docker alternative: 
## Demo flow

Landing → **Explore Creators** → search "AI Filmmaker" → add the **Runway** filter → open **Aarav Mehta** → portfolio, tools, verification → **Invite to Brief** → fill in the form → **Publish Brief** → "Your brief is live." → **View on Briefs** (the new brief is listed first and highlighted).
