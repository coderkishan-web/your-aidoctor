# 🩺 Medora — Master Project Reference Guide (`imp.md`)

> **Single Source of Truth** for the entire `repoclone` project — covering directory structure, frontend & backend architecture, complete API catalog, database fallback, and step-by-step production deployment guide for going live.

---

## 📌 1. Project Overview & Tech Stack

| Parameter | Specification |
|---|---|
| **App Name** | **Medora** (formerly Medora) |
| **Frontend Framework** | Next.js 14 (App Router) + React 18 + Tailwind CSS + Lucide Icons |
| **Backend Framework** | Node.js + Express.js (ES Modules `type: module`) |
| **AI Engine** | Google Gemini API (`gemini-flash-latest`) + 15-Step Cognitive Pipeline |
| **Medical RAG Dataset** | 3,100 Clinical Dialogue Records (`backend/data/full_medical_dataset.jsonl`) |
| **Primary Database** | Cloud MySQL Database |
| **Resilient Storage Fallback**| JSON File Storage (`backend/data/users.json`, `appointments.json`) |
| **Local Ports** | Frontend: `3000` \| Backend: `4000` |

---

## 📁 2. Complete Folder Structure Tree

```
repoclone/
├── web/                             ← 🌐 FRONTEND (Next.js 14 App — Port 3000)
│   ├── app/                         ← App router pages & API proxy routes
│   │   ├── api/
│   │   │   ├── chat/route.ts        ← AI Chat streaming proxy (Plain text ➔ SSE converter)
│   │   │   └── proxy/[...path]/     ← Universal backend API proxy (Auth, Users, Maps)
│   │   ├── layout.tsx               ← Main HTML root layout & meta tags
│   │   └── page.tsx                 ← Application entry point
│   ├── components/                  ← React UI Components
│   │   ├── MedoraApp.tsx             ← Core app shell, navigation router & view dispatcher
│   │   ├── chat/                    ← Chat bubbles, greeting cards, typing indicators
│   │   └── views/                   ← Main page views
│   │       ├── ChatView.tsx         ← Interactive AI consultation chat screen
│   │       ├── LoginView.tsx        ← Login & registration modal with auth handlers
│   │       ├── ProfileView.tsx      ← User profile & health data summary
│   │       ├── SettingsView.tsx     ← Server-side Gemini API status card
│   │       ├── EmergencyView.tsx    ← Helpline numbers (108/112) & GPS hospital locator
│   │       ├── HealthDashboard.tsx  ← Vitals & health tracker charts
│   │       ├── MyMedicinesView.tsx  ← Medication inventory & dosage schedule
│   │       ├── AppointmentsView.tsx ← Doctor appointment bookings & slots
│   │       └── AboutModal.tsx       ← Application version & medical disclaimers
│   ├── lib/                         ← Client utilities & custom state hooks
│   │   ├── hooks/
│   │   │   ├── useChat.ts           ← SSE streaming parser & message history state
│   │   │   ├── useAuth.ts           ← Authentication token & session state
│   │   │   └── useHealth.ts         ← Local health metrics & appointments manager
│   │   ├── i18n/                    ← Multi-language translation dictionaries
│   │   └── medora-orchestrator/      ← Offline fallback providers
│   ├── .env.local                   ← Frontend local environment config
│   └── package.json                 ← Frontend dependencies
│
├── 9-HuggingFace-Global/            ← ⚙️ BACKEND (Express Node.js Server — Port 4000)
│   ├── server.js                    ← Express entry point & middleware registration
│   ├── controllers/                 ← Request handling logic
│   │   ├── aiController.js          ← AI Chat, onboarding, & report generator endpoints
│   │   ├── userController.js        ← Register, login, profile, appointment booking, payments
│   │   ├── doctorController.js      ← Doctor portal login, schedule, appointments
│   │   ├── adminController.js       ← Admin metrics, add doctors, toggle availability
│   │   └── mapController.js         ← OpenStreetMap Overpass hospital search
│   ├── routes/                      ← Express URL router definitions
│   │   ├── aiRoute.js               ← /api/ai/chat, /api/ai/onboard, /api/ai/report
│   │   ├── userRoute.js             ← /api/user/* & /api/auth/* routes
│   │   ├── doctorRoute.js           ← /api/doctor/* routes
│   │   ├── adminRoute.js            ← /api/admin/* routes
│   │   └── mapRoute.js              ← /api/map/nearby-hospitals
│   ├── services/ai/                 ← 🧠 15-Step AI Cognitive Pipeline
│   │   ├── ConversationDirector.js  ← Master AI orchestration & session manager
│   │   ├── GeminiService.js         ← Google Gemini REST API caller with model failover
│   │   ├── PromptBuilder.js         ← Persona prompt generator (Short, friendly, no fillers)
│   │   ├── IntentEngine.js          ← Symptom intent & confidence scorer
│   │   ├── DatasetRetrieval.js      ← Clinical RAG search in 3,100 dialogue records
│   │   ├── SafetyEngine.js          ← Emergency red-flag intercept (108/112 trigger)
│   │   └── ValidationEngine.js      ← Output sanitizer & multiline bullet formatter
│   ├── middleware/
│   │   ├── authUser.js              ← Bearer JWT token verification & guest fallback
│   │   └── securityMiddleware.js    ← CORS, rate limiting, and header protection
│   ├── config/
│   │   ├── database.js              ← MySQL database connector with JSON file fallback
│   │   └── cloudinary.js            ← Cloudinary image storage initialization
│   ├── data/                        ← Local database storage & datasets
│   │   ├── full_medical_dataset.jsonl ← 3,100 clinical dialogue records
│   │   ├── users.json               ← Registered users fallback file
│   │   └── appointments.json        ← Appointments fallback file
│   ├── .env                         ← Backend local environment secrets
│   └── package.json                 ← Backend dependencies
│
├── guide.md                         ← Local setup quickstart guide
└── imp.md                           ← Master reference documentation (this file)
```

---

## 🔌 3. Complete API Catalog

### 🌐 Frontend API Proxies (`repoclone/web/app/api/`)
| Method | Route Path | Target Endpoint | Description |
|---|---|---|---|
| `POST` | `/api/chat` | `http://localhost:4000/api/ai/chat` | Main AI chat proxy. Converts plain text into SSE stream (`data: json`). |
| `ALL` | `/api/proxy/[...path]` | `http://localhost:4000/api/[...path]` | Universal proxy for auth, user, doctors, and maps. |

---

### ⚙️ Backend Endpoints (`repoclone/9-HuggingFace-Global/`)

#### 🔑 Auth & User Routes (`/api/auth/*` & `/api/user/*`)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ No | Registers user with email/password. Returns JWT token & user object. |
| `POST` | `/api/auth/login` | ❌ No | Authenticates user credentials. Returns JWT token & user object. |
| `GET` | `/api/auth/me` | ✅ Bearer JWT | Fetches current user profile details. |
| `POST` | `/api/user/update-profile` | ✅ Bearer JWT | Updates phone, address, dob, gender & profile photo. |
| `POST` | `/api/user/book-appointment` | ✅ Bearer JWT | Books a doctor appointment slot. |
| `GET` | `/api/user/appointments` | ✅ Bearer JWT | Returns appointments booked by user. |
| `POST` | `/api/user/cancel-appointment` | ✅ Bearer JWT | Cancels appointment & frees doctor slot. |
| `POST` | `/api/user/payment-razorpay` | ✅ Bearer JWT | Generates Razorpay payment order. |
| `POST` | `/api/user/verifyRazorpay` | ✅ Bearer JWT | Verifies Razorpay payment signature. |
| `POST` | `/api/user/payment-stripe` | ✅ Bearer JWT | Creates Stripe checkout session URL. |
| `POST` | `/api/user/verifyStripe` | ✅ Bearer JWT | Verifies Stripe payment success. |

#### 🧠 AI Medical Companion (`/api/ai/*`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Executes 15-step cognitive pipeline (Intent, 3,100 RAG, Gemini API generation). |
| `POST` | `/api/ai/onboard` | Processes intake health questionnaire. |
| `POST` | `/api/ai/report` | Generates structured medical PDF/JSON report. |

#### 📍 GPS Map & Location (`/api/map/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET`/`POST` | `/api/map/nearby-hospitals` | Queries OpenStreetMap Overpass API for nearby hospitals, ERs, and pharmacies. |

#### 👨‍⚕️ Doctor Portal (`/api/doctor/*`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/doctor/list` | Returns list of available doctors for appointment booking. |
| `POST` | `/api/doctor/login` | Doctor portal authentication. |
| `GET` | `/api/doctor/appointments` | Doctor fetches assigned patient appointments. |
| `POST` | `/api/doctor/complete-appointment` | Marks patient consultation completed. |
| `GET` | `/api/doctor/dashboard` | Doctor earnings & patient metrics. |

#### 👑 Admin Portal (`/api/admin/*`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/login` | Admin portal authentication. |
| `POST` | `/api/admin/add-doctor` | Registers a new doctor account on platform. |
| `POST` | `/api/admin/all-doctors` | Fetches all doctors registered in system. |
| `POST` | `/api/admin/change-availability` | Toggles doctor online/offline status. |
| `GET` | `/api/admin/dashboard` | Platform metrics & appointment stats. |

---

### ☁️ External Third-Party APIs

1. **Google Gemini API** (`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`):  
   - Primary LLM engine for real-time medical conversation.
2. **OpenStreetMap Overpass API** (`https://overpass-api.de/api/interpreter`):  
   - Free GPS hospital & pharmacy locator.
3. **Cloudinary API** (`https://api.cloudinary.com`):  
   - Profile photo CDN storage.
4. **Razorpay & Stripe APIs**:  
   - Online appointment payment gateways.

---

## 🚀 4. Going Live & Production Deployment Guide

When deploying **Medora** to production, follow this exact guide to configure domain URLs and environment variables.

```
                  ┌─────────────────────────────────────────┐
                  │ 🌐 FRONTEND: Deploy on Vercel           │
                  │ Repository root: repoclone/web          │
                  │ Domain: https://medora.in         │
                  └────────────────────┬────────────────────┘
                                       │
                                       │ API Requests
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ ⚙️ BACKEND: Deploy on Railway / Render  │
                  │ Repository root: repoclone/9-HF-Global  │
                  │ Domain: https://api.medora.in     │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │ ☁️ EXTERNAL SERVICES                    │
                  │ Google Gemini API / MySQL Cloud DB     │
                  └─────────────────────────────────────────┘
```

---

### Step 1: Configure Frontend Production Secrets (`repoclone/web/.env.local` / Vercel Dashboard)

In your Vercel Project Settings ➔ **Environment Variables**, add:

```env
# Point to your live backend domain
HF_BACKEND_URL=https://api.medora.in
NEXT_PUBLIC_BACKEND_URL=https://api.medora.in

# Frontend Production Domain
NEXT_PUBLIC_SITE_URL=https://medora.in
```

---

### Step 2: Configure Backend Production Secrets (`repoclone/9-HuggingFace-Global/.env` / Railway / Render)

In your Backend Cloud Provider (Railway / Render / VPS), add:

```env
PORT=4000
NODE_ENV=production

# Google Gemini API Key
GEMINI_API_KEY=your_production_gemini_api_key_here

# JWT Authentication Secret
JWT_SECRET=your_super_secret_jwt_key_32_chars_long

# Cloud MySQL Database Connection (Optional — automatically falls back to JSON files if omitted)
DB_HOST=your_mysql_host.c.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your_mysql_password
DB_NAME=defaultdb
DB_PORT=24479

# Cloudinary Storage Secrets (Optional — for doctor/user profile photos)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

# Payment Gateways (Optional — for doctor appointment booking)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CURRENCY=INR
```

---

### Step 3: Update CORS Allowed Origins (`repoclone/9-HuggingFace-Global/server.js`)

Ensure your backend CORS settings in `server.js` permit requests from your live frontend domain:

```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'https://medora.in',           // ← Your Production Domain
      'https://www.medora.in',       // ← Your WWW Domain
      'https://medora.vercel.app'    // ← Vercel Preview Domain
    ];
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## 💻 5. Local Development Quickstart

To run the full stack locally:

### Terminal 1 — Start Backend:
```bash
cd repoclone/9-HuggingFace-Global
node server.js
```
> Output: `Server started on PORT:4000` ✅

### Terminal 2 — Start Frontend:
```bash
cd repoclone/web
npm run dev
```
> Output: `Ready on http://localhost:3000` ✅

Open **`http://localhost:3000`** in your web browser.
