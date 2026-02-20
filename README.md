<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Go-1.21-00ADD8?logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/LangGraph-AI-blueviolet" alt="LangGraph" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Qdrant-Vector_DB-DC382D" alt="Qdrant" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

# 🏥 VanguardHealth v2

**Secure Medical Data Platform** — An intelligent health data management system featuring AI-powered insights capable of analyzing health trends, providing recommendations, and answering medical queries via AI Chat.

---

## ✨ Features

- 🤖 **AI Chat** — Health-related Q&A and patient data analysis powered by Llama 3.3 70B (Groq) + LangGraph.
- 🔍 **RAG Search** — Semantic search across all patient records using Qdrant Vector DB + Gemini Embeddings.
- 📊 **Medical Insights** — Automated health trend analysis visualized with Recharts.
- 🔐 **Data Integrity** — SHA-256 hashing for every health record + comprehensive audit logs.
- 🏗️ **Microservices** — Decoupled Frontend, Backend, and AI Service architecture using Docker Compose.

---

## 🏛️ Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    🌐 Frontend (Next.js 14)                  │
│              Tailwind CSS · Recharts · TypeScript            │
│                       Port 3000                              │
└────────────────┬───────────────────────┬─────────────────────┘
                 │                       │
                 ▼                       ▼
┌────────────────────────┐  ┌──────────────────────────────────┐
│   ⚙️ Backend (Go Echo)  │  │      🤖 AI Service (Node.js)     │
│   REST API · JWT Auth  │  │  LangGraph · LangChain · Express │
│      Port 50051        │  │         Port 3001                │
└──────────┬─────────────┘  └───────┬──────────┬───────────────┘
           │                        │          │
           ▼                        ▼          ▼
┌────────────────────────┐  ┌─────────────┐  ┌─────────────────┐
│  🐘 PostgreSQL 16      │  │ 🦙 Groq API  │  │ 📊 Qdrant       │
│  Patients · Records    │  │ Llama 3.3   │  │ Vector Search   │
│  Chat History · Audit  │  │ 70B         │  │ Gemini Embed    │
└────────────────────────┘  └─────────────┘  └─────────────────┘
```

---

## 📂 Project Structure

```text
VanguardHealth-v2/
├── services/
│   ├── web-nextjs/          # Frontend — Next.js 14 + Tailwind + Recharts
│   ├── ai-node/             # AI Service — LangGraph + Groq + Qdrant
│   └── backend-go/          # Backend — Go Echo + PostgreSQL
├── shared/
│   └── proto/               # gRPC Protocol Buffers
├── scripts/
│   └── init-db.sql          # Database schema (patients, records, audit)
├── docs/
│   └── agents.md            # AI Agents architecture documentation
├── docker-compose.yml       # Full stack orchestration
├── seed-data.sh             # Sample data seeder
├── start-all.bat            # Windows startup script
└── start-all.sh             # Linux/Mac startup script
```

---

## 🚀 Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL + Qdrant)
- [Node.js](https://nodejs.org/) ≥ 18
- [Go](https://go.dev/) ≥ 1.21

### 1. Clone & Setup Environment

```bash
git clone https://github.com/KopPuntorn/VanguardHealth-v2.git
cd VanguardHealth-v2

# Create .env file
cp .env.example .env
# Edit GEMINI_API_KEY and GROQ_API_KEY inside .env
```

### 2. Start Infrastructure

```bash
docker-compose up -d postgres qdrant
```

### 3. Run Backend (Go)

```bash
cd services/backend-go
go mod tidy
go run cmd/server/main.go
# ✅ Running on http://localhost:50051
```

### 4. Run AI Service (Node.js)

```bash
cd services/ai-node
npm install
npm run dev
# ✅ Running on http://localhost:3001
```

### 5. Run Frontend (Next.js)

```bash
cd services/web-nextjs
npm install
npm run dev
# ✅ Running on http://localhost:3000
```

> 💡 **Or use the provided startup scripts**: Run `start-all.bat` (Windows) or `./start-all.sh` (Linux/Mac)

---

## 🔌 API Endpoints

### Backend — `:50051`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/patients` | Create a new patient |
| `GET` | `/patients/:id` | Retrieve patient details |
| `POST` | `/ingest` | Store a health record (+ SHA-256 hash) |
| `GET` | `/records/:patient_id` | Retrieve all records for a specific patient |

### AI Service — `:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/chat` | Chat with AI (single/all patient mode) |
| `POST` | `/chat/stream` | Streaming chat response |
| `POST` | `/embed` | Generate text embeddings |
| `POST` | `/vectorize` | Vectorize a health record → Qdrant |

---

## 🤖 AI Agents

| Agent | Model | Role |
|-------|-------|------|
| **Chat Agent** | Llama 3.3 70B (Groq) | Answers health queries + patient data analysis |
| **RAG Engine** | Gemini Embedding (768D) | Semantic search across all patient records |
| **Insights Agent** | Llama 3.3 70B | Analyzes trends + identifies potential risk factors |

> 📖 For more details, see [docs/agents.md](docs/agents.md)

---

## ⚙️ Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | AI | Google Gemini API key (embeddings) |
| `GROQ_API_KEY` | AI | Groq API key (Llama 3.3 70B) |
| `QDRANT_URL` | AI | Qdrant vector database URL |
| `BACKEND_URL` | AI | Go backend API URL |
| `DATABASE_URL` | Backend | PostgreSQL connection string |

---

## 🧪 Testing

```bash
# Unit Tests (Frontend)
cd services/web-nextjs
npm test

# E2E Tests (Playwright)
npm run test:e2e
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `patients` | Patient core details (id, name, dob, gender) |
| `health_records` | Medical records + SHA-256 data hash |
| `chat_history` | AI conversation history |
| `audit_logs` | Audit trail for security compliance |

---

## 🛣️ Roadmap

- [ ] **Diagnosis Suggestion Agent** — Suggests possible diagnoses based on symptoms.
- [ ] **Drug Interaction Checker** — Validates potential adverse drug-drug interactions.
- [ ] **Appointment Scheduler** — Assists with booking patient appointments.
- [ ] **Voice Input Agent** — Processes voice-based medical commands.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 14 · React 18 · Tailwind CSS · Recharts · TypeScript |
| **Backend** | Go 1.21 · Echo Framework · pgx (PostgreSQL driver) |
| **AI/ML** | LangGraph · LangChain · Groq (Llama 3.3 70B) · Google Gemini |
| **Databases** | PostgreSQL 16 · Qdrant (Vector DB) |
| **Infra** | Docker Compose · gRPC / Protocol Buffers |
| **Testing** | Jest · Playwright · React Testing Library |

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/KopPuntorn">KopPuntorn</a>
</p>
