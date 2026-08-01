<div align="center">

<img src="web/public/favicon.svg" alt="YourAIDoctor Logo" width="90" />

# 🩺 YourAIDoctor — Full-Stack AI Medical Assistant & Appointment Platform

### Smart AI Clinical Triage • Instant Symptom Guidance • Doctor Appointments

[**Architecture Guide (imp.md)**](imp.md) &nbsp;&bull;&nbsp; [**Local Setup (guide.md)**](guide.md)

</div>

---

## 🌟 Overview

**YourAIDoctor** is a modern, full-stack AI medical companion application built to provide quick, empathetic, and clear healthcare guidance. Powered by Google Gemini (`gemini-flash-latest`), a 15-step cognitive pipeline, and a RAG dataset of 3,100 clinical dialogue records, it offers instant triage while enabling seamless doctor appointment bookings.

---

## 🏗️ Project Architecture

The project consists of two core applications inside `repoclone`:

1. **`web/` (Next.js 14 Frontend — Port 3000)**:
   - Modern React UI built with Next.js 14 App Router and Tailwind CSS.
   - Handles real-time Server-Sent Events (SSE) chat streaming, health dashboards, medication inventory, and doctor appointment booking UI.
   - Built-in API Proxy (`/api/chat` and `/api/proxy/[...path]`) to securely hide backend credentials and handle CORS seamlessly.

2. **`9-HuggingFace-Global/` (Express Node.js Backend — Port 4000)**:
   - Full Express Node.js engine executing the **15-Step AI Cognitive Pipeline**.
   - Integrates Google Gemini API (`gemini-flash-latest`) with multi-model failovers.
   - Performs RAG search over 3,100 clinical dialogue records (`data/full_medical_dataset.jsonl`).
   - Resilient database storage with cloud MySQL support and transparent local JSON file fallbacks (`users.json`, `appointments.json`).

---

## ⚡ Quick Start Guide

### 1. Start Express Backend (Port 4000)
```bash
cd 9-HuggingFace-Global
node server.js
```

### 2. Start Next.js Frontend (Port 3000)
```bash
cd web
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🔌 API Endpoints Summary

- `POST /api/ai/chat` — Core AI Medical Companion streaming chat
- `POST /api/auth/register` — User registration & JWT generation
- `POST /api/auth/login` — User login & session retrieval
- `GET /api/user/appointments` — Fetch user booked doctor appointments
- `POST /api/user/book-appointment` — Book doctor consultation slot
- `GET /api/map/nearby-hospitals` — OpenStreetMap GPS hospital search

For the complete API catalog and deployment guide, see [**`imp.md`**](imp.md).

---

## 📄 License & Disclaimer

*This application is designed for educational and triage assistance purposes. It does not replace professional medical diagnosis.*
