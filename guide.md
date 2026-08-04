# 🩺 Medora — Local Developer Guide

> Complete guide to start the app locally, understand the architecture, database, and both frontend/9-HuggingFace-Global.

---

## 📁 Project Structure (inside `repoclone/`)

```
repoclone/
│
├── web/                        ← 🌐 FRONTEND (Next.js 14 — Main App UI)
│   ├── app/                    ← Pages & API proxy routes
│   ├── components/             ← UI components (chat, emergency, settings, etc.)
│   ├── lib/                    ← Hooks, types, utilities, AI orchestrator
│   ├── .env.local              ← ⚙️ Environment config (9-HuggingFace-Global URL, API keys)
│   ├── package.json
│   └── next.config.js
│
├── 9-HuggingFace-Global/       ← ⚙️ BACKEND (Next.js server — AI + API engine)
│   ├── app/                    ← API routes (chat, auth, map, etc.)
│   ├── lib/                    ← AI pipeline, providers, session manager
│   ├── data/                   ← Medical datasets for AI RAG
│   ├── .env                    ← ⚙️ Environment config (Gemini key, DB, etc.)
│   ├── package.json
│   └── next.config.js
│
├── guide.md                    ← 📖 This file
└── README.md
```

---

## 🌐 FRONTEND

### 📍 Location
```
repoclone/web/
```

### 🚀 How to Start

Open **Terminal 1**:
```bash
cd "c:\Users\kishan shinde\Desktop\dr.appointmentai\repoclone\web"
npm run dev
```

### ✅ Expected Output
```
▲ Next.js 14.2.35
  - Local:        http://localhost:3000
  - Environments: .env.local
✓ Ready in 4s
```

### 🌐 Frontend URL
```
http://localhost:3000
```

### 🔑 Frontend Environment — `repoclone/web/.env.local`

```env
# Points to the 9-HuggingFace-Global (9-HuggingFace-Global on port 4000 locally)
HF_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Site config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=contact@coderkishan.in
```

> [!IMPORTANT]
> For production, change `HF_BACKEND_URL` and `NEXT_PUBLIC_BACKEND_URL` to your live 9-HuggingFace-Global URL (e.g., `https://medora.in`).

---

## ⚙️ BACKEND

### 📍 Location
```
repoclone/9-HuggingFace-Global/
```

> [!NOTE]
> This is a **Next.js app** that acts as the full 9-HuggingFace-Global — it runs the AI pipeline (Gemini API), handles authentication, medical RAG, and all API routes.

### 🚀 How to Start

Open **Terminal 2**:
```bash
cd "c:\Users\kishan shinde\Desktop\dr.appointmentai\repoclone\9-HuggingFace-Global"
node server.js
```

### ✅ Expected Output
```
▲ Next.js
  - Local:        http://localhost:4000
✓ Ready
```

### 🌐 Backend URL
```
http://localhost:4000
```

### 🔑 Backend Environment — `repoclone/9-HuggingFace-Global/.env`

```env
# Google Gemini API Key (primary AI engine)
GEMINI_API_KEY=your_gemini_api_key_here

PORT=4000
```

---

## 🖥️ Start Both — Step by Step

### Terminal 1 — Start Backend
```bash
cd "c:\Users\kishan shinde\Desktop\dr.appointmentai\repoclone\9-HuggingFace-Global"
node server.js
```
> Wait until: `Server started on PORT:4000`

### Terminal 2 — Start Frontend
```bash
cd "c:\Users\kishan shinde\Desktop\dr.appointmentai\repoclone\web"
npm run dev
```
> Wait until: `✓ Ready` on port 3000

### Open in Browser
```
http://localhost:3000
```

---

## 🗄️ DATABASE

### Primary: MySQL (Aiven Cloud)

| Property | Value |
|---|---|
| Type | MySQL 8.x (cloud-hosted) |
| Status | Cloud-hosted — requires internet |

> [!NOTE]
> If MySQL is unreachable, the 9-HuggingFace-Global **automatically falls back** to local JSON files. No manual action required.

---

### Fallback: Local JSON Files

When MySQL is unavailable, data is stored in:

```
repoclone/9-HuggingFace-Global/data/
```

| File | Purpose |
|---|---|
| `users.json` | Registered user accounts |
| `doctors.json` | Doctor profiles |
| `appointments.json` | Booked appointments |
| `medical_dataset.json` | 1,000 medical Q&A records |
| `full_medical_dataset.jsonl` | **3,100 clinical dialogues** (AI RAG source) |
| `healthKnowledgeBase.json` | Rule-based clinical triage knowledge |

**How the fallback works:**
```
Backend starts
  │
  ├─ Tries MySQL (cloud)
  │     ├─ ✅ Connected → uses MySQL
  │     └─ ❌ Failed   → auto-switches to JSON files
  │
  └─ ALWAYS loads AI datasets (medical_dataset, full_medical_dataset.jsonl)
```

> [!TIP]
> Data saved in fallback mode (signups, appointments) **persists** between restarts — it's written to disk in the `/data/` folder.

---

## 🔁 How Frontend Connects to Backend

```
Browser  →  http://localhost:3000  (Frontend — repoclone/web)
                    │
                    ├─ /api/chat          →  localhost:4000/api/chat
                    ├─ /api/proxy/user/*  →  localhost:4000/api/user/*
                    ├─ /api/proxy/ai/*    →  localhost:4000/api/ai/*
                    └─ /api/proxy/map/*   →  localhost:4000/api/map/*
                                ↓
              Backend  →  http://localhost:4000  (repoclone/9-HuggingFace-Global)
                                │
                                └─ Google Gemini API  (external)
```

Proxy routes live in:
```
repoclone/web/app/api/
├── chat/route.ts              ← AI chat proxy
└── proxy/[...path]/route.ts   ← General API proxy
```

---

## 🤖 AI Model

| Priority | Engine | Key Location |
|---|---|---|
| 1 — Primary | **Google Gemini API** | `GEMINI_API_KEY` in `.env` |
| 2 — Fallback | **Groq** (optional) | `GROQ_API_KEY` in `.env` |

AI is 100% **server-side** — users do not configure any API keys in the UI (Settings only shows language, region, voice, and display options).

---

## 🔐 Authentication

```
Sign up:   POST /api/user/register  →  returns JWT token
Log in:    POST /api/user/login     →  returns JWT token

Authenticated requests:
  Header:  { "token": "eyJhbGci..." }

Guest mode (no login):
  Chat works without any token
  Session stored in memory only
```

---

## 📡 Key API Endpoints (Backend)

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/` | GET | None | Health check |
| `/api/user/register` | POST | None | Sign up |
| `/api/user/login` | POST | None | Login |
| `/api/chat` | POST | Optional | AI chat (guest ok) |
| `/api/ai/chat` | POST | JWT | Authenticated AI chat |
| `/api/ai/onboard` | POST | JWT | Health onboarding |
| `/api/ai/log-vitals` | POST | JWT | Log vitals |
| `/api/map/nearby` | GET | None | Nearby hospitals |
| `/api/ai/who-data` | GET | None | WHO guidelines |

---

## 🧪 Quick Verification

After starting both servers:

```bash
# 1. Backend alive?
curl http://localhost:4000/

# 2. Chat working?
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{\"messages\":[{\"role\":\"user\",\"content\":\"I have a fever\"}]}"

# 3. Signup test
curl -X POST http://localhost:4000/api/user/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"email\":\"test@test.com\",\"password\":\"Test@1234\"}"
```

---

## 🚀 Production Deployment

### Frontend → Vercel
Update `repoclone/web/.env.local`:
```env
HF_BACKEND_URL=https://your-live-9-HuggingFace-Global.com
NEXT_PUBLIC_BACKEND_URL=https://your-live-9-HuggingFace-Global.com
NEXT_PUBLIC_SITE_URL=https://medora.in
```
Deploy with: `vercel --prod` (from `repoclone/web/`)

### Backend → Railway / Render / VPS
Deploy `repoclone/9-HuggingFace-Global/` with all `.env` variables set.
Run: `npm run start` (or `npm run dev` for local).

---

*Medora — [medora.in](https://medora.in) | GitHub: [coderkishan-web/your-aidoctor](https://github.com/coderkishan-web/your-aidoctor) | Author: [coderkishan.in](https://coderkishan.in)*
