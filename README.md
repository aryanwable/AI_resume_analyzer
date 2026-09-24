# AI Resume Analyzer & Career Assistant 🚀

A production-grade, portfolio-ready AI SaaS application that empowers job seekers to analyze resumes against target job descriptions, calculate transparent **6-pillar explainable match scores**, evaluate **semantic vector similarity**, optimize bullet points using the **Google X-Y-Z formula**, and receive **evidence-grounded career recommendations** with **zero AI hallucinations**.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Tests](https://img.shields.io/badge/tests-98%2F98%20passing-success)
![Vite](https://img.shields.io/badge/frontend-React%2018%20%7C%20Vite%206-blue)
![Backend](https://img.shields.io/badge/backend-Node.js%20%7C%20Express%20ESM-green)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## 📑 Table of Contents

1. [Key Features](#-key-features)
2. [Architecture & System Design](#-architecture--system-design)
3. [Explainable 6-Pillar Scoring Engine](#-explainable-6-pillar-scoring-engine)
4. [NLP & AI Pipeline (Zero-Hallucination Guarantee)](#-nlp--ai-pipeline-zero-hallucination-guarantee)
5. [Tech Stack](#-tech-stack)
6. [Interactive Application Modules](#-interactive-application-modules)
7. [REST API Reference](#-rest-api-reference)
8. [Installation & Setup](#-installation--setup)
9. [Environment Variables](#-environment-variables)
10. [Testing & Quality Assurance](#-testing--quality-assurance)
11. [Production Deployment Guide](#-production-deployment-guide)
12. [Interview Presentation & Demonstration Track](#-interview-presentation--demonstration-track)

---

## 🌟 Key Features

- 📄 **Secure PDF Processing & Text Extraction**: Memory-buffer parsing with binary magic-byte (`%PDF-`) validation and size limits via `pdf-parse` v2.
- 🎯 **Explainable 6-Pillar Scoring Engine**: Transparent 100-point deterministic evaluation with actionable feedback across Skills, Keywords, Experience, Projects, ATS Layout, and Education.
- 🧠 **Semantic Vector Conceptual Matching**: Dual-layer vector space cosine similarity & Jaccard overlap measuring conceptual synergy beyond exact keyword matches.
- 🏷️ **Comprehensive Skill Taxonomy**: 8-category skill extractor (Languages, Frameworks, Databases, Cloud, DevOps, Tools, AI/Data, Soft Skills) with alias resolution (`k8s` -> `Kubernetes`, `ts` -> `TypeScript`, `postgres` -> `PostgreSQL`).
- ✍️ **AI Bullet Point Optimizer**: Interactive Google X-Y-Z formula rewriter converting weak bullet points into executive action-verb accomplishments without fabricating data.
- 📝 **Executive Summary Generator**: Fact-grounded 3-sentence career summary generator tailored to any target job role.
- 🚀 **Career Track Recommender**: Surfacing high-compatibility job titles with percentage fit and factual justifications.
- 📊 **Candidate Cockpit & Analytics**: Recharts-powered historical score trends, 6-pillar radar competency charts, and chronological analysis archive.
- 🛡️ **Enterprise-Grade Security**: JWT authentication, bcryptjs salted hashing, strict resource ownership guards, CORS whitelisting, and centralized error envelopes.

---

## 🏗️ Architecture & System Design

```
                     ┌────────────────────────────────────────────────────────┐
                     │                 React 18 + Vite Frontend               │
                     │  (Tailwind CSS, Recharts, React Router, Axios Client)  │
                     └───────────────────────────┬────────────────────────────┘
                                                 │ HTTPS / JSON & Multipart
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Express.js Backend Service                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Middleware Layer:                                                                            │
│    - CORS Whitelist, JSON Body Parser, JWT Auth Guard (`authMiddleware`), Multer Buffer Guard │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. Routes & Controllers:                                                                        │
│    - `/api/auth`    -> User Registration, Login & Session Management                            │
│    - `/api/resumes` -> PDF Upload, Text Extraction, Scoring, History Management                 │
│    - `/api/ai`      -> Bullet Optimizer, Summary Generator, Role Recommender                    │
│    - `/api/health`  -> Service Diagnostics & MongoDB Connection Status                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. Core Engine & NLP Services:                                                                  │
│    - `textPreprocessor.js` : Text normalization, sentence tokenizer, section segmenter         │
│    - `skillExtractor.js`   : 8-category taxonomy database, alias resolution, boundary guards    │
│    - `keywordMatcher.js`   : Unigrams, bigrams, weighted TF, action verbs, keyword density      │
│    - `semanticMatcher.js`  : Vector space cosine similarity & conceptual alignment              │
│    - `resumeScorer.js`     : 6-pillar deterministic 100-point explainable evaluator             │
│    - `aiService.js`        : LLM API integration + High-fidelity zero-hallucination fallback   │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. Persistence Layer:                                                                           │
│    - MongoDB Atlas / Mongoose: Users (`User.js`), Analysis Archive (`ResumeAnalysis.js`)       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚖️ Explainable 6-Pillar Scoring Engine

Unlike naive AI tools that prompt an LLM to invent an arbitrary score, our engine calculates an **auditable, deterministic 100-point score**:

| Pillar | Weight | Evaluation Criteria |
|---|---|---|
| **1. Skills Match** | **25%** | Taxonomy overlap across 8 categories, penalty for missing critical core requirements, bonus for dedicated skills section. |
| **2. Keyword Alignment** | **20%** | Unigram and bigram domain phrase overlap, weighted term frequencies, and keyword density. |
| **3. Experience & Impact** | **20%** | Active action verbs presence (`architected`, `engineered`, `scaled`), quantified metrics (%, $, numbers), and employment tenure. |
| **4. Project Relevance** | **15%** | Presence of technical projects, modern technology stack application, repository (`github.com/`) or live demo links. |
| **5. ATS Parseability** | **10%** | Standard header recognition, parseable contact metadata (email, phone, LinkedIn/GitHub), document word count density. |
| **6. Education & Credentials** | **10%** | Academic degrees (B.S., M.S., B.Tech, Computer Science), and professional industry certifications (AWS, Kubernetes, GCP). |

### Grading Scale:
- `A` / `A+`: 90–100 pts (Exceptional Fit)
- `A-` / `B`: 70–89 pts (Strong Qualification)
- `C`: 60–69 pts (Moderate Alignment)
- `D` / `F`: <60 pts (Critical Skill Gaps)

---

## 🛡️ NLP & AI Pipeline (Zero-Hallucination Guarantee)

### Critical Integrity Guardrails:
1. **Never Fabricate Metrics**: The AI is strictly prohibited from inventing percentage growth, latency numbers, revenue figures, or employers not present in the original resume.
2. **Evidence Grounding**: Every identified strength, weakness, and recommendation must cite factual content from the candidate's document.
3. **Structured JSON Validation**: All AI responses are validated against rigorous JSON schemas before delivery.
4. **Resilient Dual-Mode Execution**:
   - **Live LLM Mode**: Uses OpenAI-compatible endpoints (`gpt-4o-mini`) when `AI_API_KEY` is provided.
   - **Built-in Heuristic Mode**: Uses high-fidelity deterministic NLP heuristics when offline or without an API key, ensuring **100% zero-downtime operation**.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 with Vite 6
- **Styling**: Tailwind CSS with custom brand design system
- **Routing**: React Router v6 with Protected Route guards
- **Charts & Visualization**: Recharts (Area charts, 6-Pillar Radar charts)
- **Icons**: Lucide React
- **HTTP Client**: Axios with Bearer token interceptor

### Backend
- **Runtime**: Node.js v20+ (ECMAScript Modules)
- **Server Framework**: Express.js
- **Database & ODM**: MongoDB & Mongoose
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Upload**: Multer (In-Memory Buffer Pipeline)
- **PDF Extraction**: pdf-parse v2 (Class-based PDFParse API)
- **Test Runner**: Node.js Native Test Runner (`node --test`)

---

## 🚀 Interactive Application Modules

1. **Upload & Score (`/upload`)**: Drag-and-drop PDF dropzone, job description presets, multi-step progress animation, 6-pillar score report, semantic conceptual gauge, and AI coach feedback.
2. **Analysis Detail View (`/history/:id`)**: Comprehensive evaluation report with 6-pillar Recharts Radar chart, matched/missing keyword pills, action verb breakdown, print dialog, and JSON clipboard export.
3. **AI Career Studio (`/ai-tools`)**:
   - *Tab 1: Bullet Point Optimizer* (Side-by-side diff using action verbs).
   - *Tab 2: Executive Summary Generator* (3-sentence tailored profile summaries).
   - *Tab 3: Job Role Recommender* (Career track discovery with percentage fit).
4. **Candidate Cockpit Dashboard (`/dashboard`)**: Historical score progression area chart, live KPI summaries, recent evaluation table, and quick tool shortcuts.
5. **Analysis History Archive (`/history`)**: Chronological archive of past resume evaluations with grade badges, search, and one-click deletion.

---

## 🔌 REST API Reference

### Authentication Endpoints
- `POST /api/auth/register` — Register user (`name`, `email`, `password`) -> `201 Created`
- `POST /api/auth/login` — Authenticate user -> `200 OK` + Signed JWT
- `GET /api/auth/me` — Retrieve authenticated user profile -> `200 OK`

### Resume & Scoring Endpoints
- `POST /api/resumes/upload` — Multipart PDF upload + text extraction -> `201 Created`
- `POST /api/resumes/score` — 6-pillar scoring + semantic matching + AI advice + history save -> `200 OK`
- `GET /api/resumes/history` — List authenticated user's past evaluations -> `200 OK`
- `GET /api/resumes/history/:id` — Full analysis details for owner -> `200 OK`
- `DELETE /api/resumes/history/:id` — Delete analysis record -> `200 OK`

### AI Career Studio Endpoints
- `POST /api/ai/rewrite-bullet` — Action-verb bullet rewrite -> `200 OK`
- `POST /api/ai/generate-summary` — Fact-grounded summary generation -> `200 OK`
- `POST /api/ai/recommend-roles` — Competency-based role recommendations -> `200 OK`

### System Health
- `GET /api/health` — Service metrics, uptime, and database state -> `200 OK`

---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/ai-resume-analyzer`) or MongoDB Atlas URI

### 1. Clone the Repository
```bash
git clone https://github.com/aryanwable/AI_resume_analyzer.git
cd AI_resume_analyzer
```

### 2. Backend Setup
```bash
cd server
npm install
cp ../.env.example .env
npm run dev
# Server starts on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev
# Client starts on http://localhost:5173
```

---

## ⚙️ Environment Variables

Create `.env` in `server/` (see `.env.example`):

```env
# Application Port & Node Environment
PORT=5000
NODE_ENV=development

# Database Connection
MONGODB_URI=mongodb://127.0.0.1:27017/ai-resume-analyzer

# JWT Security
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# Client URL (CORS Whitelist)
CLIENT_URL=http://localhost:5173

# AI & LLM Integration (Optional - system falls back to built-in heuristic engine if omitted)
AI_API_KEY=

# File Upload Limits
MAX_FILE_SIZE_BYTES=5242880
MIN_FILE_SIZE_BYTES=500
```

---

## 🧪 Testing & Quality Assurance

The project features a **98-test automated test suite** using Node.js's native test runner:

```bash
cd server
npm test
```

### Test Coverage Highlights:
- ✅ **Authentication API**: User registration, password encryption, JWT generation, invalid inputs, duplicate emails.
- ✅ **Authorization Security**: Route guards, token tampering, token expiration, multi-tenant ownership isolation.
- ✅ **PDF Upload & Validation**: Magic-byte verification (`%PDF-`), minimum size limits, corrupted payloads.
- ✅ **Text Extraction**: Text token count matching, pdf-parse v2 integration.
- ✅ **Text Preprocessing**: Unicode normalization, abbreviation-safe sentence splitting, section segmentation, contact parsing.
- ✅ **Skill & Keyword Extraction**: 8-category taxonomy, alias mapping, false positive immunity, action verb detection.
- ✅ **Explainable Scoring**: 6-pillar weights, grade derivation, category breakdowns.
- ✅ **Semantic Matching**: Vector space cosine similarity and Jaccard overlap computation.
- ✅ **AI Career Tools**: Bullet rewriting, summary generation, role recommendation, error handling.

---

## 🚢 Production Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Set Root Directory: `client`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend-service.com`

### Backend Deployment (Render / Railway / AWS EC2)
1. Set Root Directory: `server`
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Configure Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `AI_API_KEY`).

---

## 🎤 Interview Presentation & Demonstration Track

When discussing this project in technical interviews, emphasize these architectural achievements:

1. **Why Deterministic Scoring beats Pure LLM Scoring**:
   *Explain that asking an LLM "give this resume a score out of 100" results in non-deterministic, hallucinatory numbers. Instead, we architected a transparent 6-pillar formula (Skills 25%, Keywords 20%, Experience 20%, Projects 15%, ATS 10%, Education 10%) where every point is mathematically explainable.*
2. **Zero-Hallucination AI Engineering**:
   *Explain how our AI service grounds all bullet improvements, summaries, and recommendations in extracted text evidence without fabricating metrics or employment history.*
3. **Dual-Layer Semantic & Keyword Matching**:
   *Discuss how keyword matching catches explicit terms, while vector cosine similarity catches conceptual overlap even when wording differs.*
4. **Resilience & Graceful Degradation**:
   *Show how the entire application functions flawlessly whether MongoDB is online or offline, and whether an external AI API key is configured or operating in built-in heuristic mode.*
5. **Enterprise-Grade Security**:
   *Highlight binary magic-byte PDF validation, bcryptjs salting, JWT authentication, and strict multi-tenant resource ownership guards.*

---

## 📄 License
This project is licensed under the MIT License — see the LICENSE file for details.
