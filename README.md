---
title: Egypyramid Cms Backend
emoji: 📊
colorFrom: purple
colorTo: gray
sdk: gradio
sdk_version: 6.28.0
python_version: '3.12'
app_file: app.py
pinned: false
---
Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference
# EgyPyramid Dashboard - Backend API

A production-ready RESTful API and serverless backend powering the **EgyPyramid Dashboard**. Built with Node.js, Express 5, and PostgreSQL (Supabase), featuring JWT authentication via httpOnly cookies, Zod schema validation, modular service architecture, and deployment support for Vercel Serverless Functions.

---

## 🛠️ Tech Stack

* **Runtime & Framework:** Node.js, Express.js (v5)
* **Database & ORM/Driver:** PostgreSQL (`pg` Pool), Supabase (`@supabase/supabase-js`)
* **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`), `bcrypt`, `cookie-parser` (httpOnly cookies), `helmet`, `express-rate-limit`
* **Validation & Utilities:** `zod` schema validation, `uuid`, `date-fns`
* **Deployment:** Vercel Serverless Functions

---

## ✨ Key Features

* **Layered Architecture:** Clear separation of concerns using Routes $\rightarrow$ Middleware (Validation/JWT) $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Database.
* **Authentication System:** Access & Refresh token rotation pattern using secure `httpOnly` cookies.
* **Input Validation:** Strict runtime request payload validation powered by Zod schemas.
* **Security Standards:** Helmet HTTP headers protection, CORS policy control, and custom rate-limiting middleware.
* **Database Integration:** Optimized `pg` connection pooling with Supabase PostgreSQL, supporting custom RPCs and direct query executions.
* **Serverless Ready:** Configured for seamless deployment as a serverless function via `vercel.json`.

---

## 📁 Project Structure

```text
backend/
├── config/             # Environment & middleware configurations (CORS, Rate Limit, DB Pool)
├── controllers/        # Request handlers split by domain (auth, dashboard, items)
├── database/           # SQL schemas and custom database stored procedures (RPC.sql)
├── middleware/         # Auth verification, rate limiting, error handling, Zod schemas
│   └── schemas/        # Zod validation schemas for API routes
├── routes/             # Route declarations
│   └── api/
│       ├── auth/       # Login, Logout, Refresh endpoints
│       └── data/       # Analytics, Medias, Seasons, Episodes, Links, Download Tasks, Genres
├── service/            # Business logic and database access layer
├── utils/              # Helper utilities and regex patterns
├── server.js           # Express app initialization & server entry point
└── vercel.json         # Vercel serverless deployment route rules

```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory and define the following variables:

```env
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# JWT Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# CORS & Client
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

```

---

## 🚀 Getting Started

### Prerequisites

* Node.js `^20.0.0` or higher
* PostgreSQL database instance or Supabase account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/eslam985/egypyramid-cms-backend.git
cd egypyramid-backend

```


2. **Install dependencies:**
```bash
npm install

```


3. **Database Setup:**
Run the SQL scripts located in `database/schema.sql` and `database/RPC.sql` inside your PostgreSQL database / Supabase SQL Editor.
4. **Run the development server:**
```bash
npm run dev

```


The API will be accessible at `http://localhost:3000`.

---

## 📡 API Overview

### Public Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Server health status check |
| `POST` | `/api/auth/login` | User login & token generation |
| `POST` | `/api/auth/refresh` | Issue new Access Token using Refresh Token cookie |
| `POST` | `/api/auth/logout` | Clear auth cookies & revoke session |

### Protected Routes (Requires JWT Header)

| Path | Resource Handled |
| --- | --- |
| `/api/data/analytics` | System counters and dashboard analytics |
| `/api/data/medias` | Movies & Series CRUD operations |
| `/api/data/seasons` | Series season management |
| `/api/data/episodes` | Episode management |
| `/api/data/links` | Streaming & download link management |
| `/api/data/downloadTasks` | Background automation tasks |
| `/api/data/genres` | Category and genre lookup tables |

---

## ⚡ Deployment

This backend is pre-configured for **Vercel Serverless Functions**.

1. Import the repository into your Vercel Dashboard.
2. Add your `.env` key-value pairs under **Project Settings > Environment Variables**.
3. Deploy. Vercel will automatically detect `vercel.json` and route API traffic through serverless handlers.