<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Go-1.21-00ADD8?logo=go&logoColor=white" alt="Go" />
  <img src="https://img.shields.io/badge/LangGraph-AI-blueviolet" alt="LangGraph" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Qdrant-Vector_DB-DC382D" alt="Qdrant" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker" />
</p>

# 🏥 VanguardHealth v2

**Secure Medical Data Platform** — ระบบจัดการข้อมูลสุขภาพอัจฉริยะ พร้อม AI-powered insights ที่สามารถวิเคราะห์แนวโน้มสุขภาพ ให้คำแนะนำ และตอบคำถามทางการแพทย์ผ่าน AI Chat

---

## ✨ Features

- 🤖 **AI Chat** — สนทนาถาม-ตอบเกี่ยวกับสุขภาพผู้ป่วย ด้วย Llama 3.3 70B (Groq) + LangGraph
- 🔍 **RAG Search** — Semantic Search ข้ามข้อมูลผู้ป่วยทั้งหมดด้วย Qdrant Vector DB + Gemini Embeddings
- 📊 **Medical Insights** — วิเคราะห์แนวโน้มสุขภาพอัตโนมัติ พร้อมกราฟ Recharts
- 🔐 **Data Integrity** — SHA-256 hash สำหรับทุก health record + audit logs
- 🏗️ **Microservices** — แยก Frontend / Backend / AI Service ด้วย Docker Compose

---

## 🏛️ Architecture

```
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

```
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

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (สำหรับ PostgreSQL + Qdrant)
- [Node.js](https://nodejs.org/) ≥ 18
- [Go](https://go.dev/) ≥ 1.21

### 1. Clone & Setup Environment

```bash
git clone https://github.com/KopPuntorn/VanguardHealth-v2.git
cd VanguardHealth-v2

# สร้างไฟล์ .env
cp .env.example .env
# แก้ไข GEMINI_API_KEY และ GROQ_API_KEY
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

> 💡 **หรือใช้ script สำเร็จรูป**: สั่ง `start-all.bat` (Windows) หรือ `./start-all.sh` (Linux/Mac)

---

## 🔌 API Endpoints

### Backend — `:50051`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/patients` | สร้างข้อมูลผู้ป่วย |
| `GET` | `/patients/:id` | ดึงข้อมูลผู้ป่วย |
| `POST` | `/ingest` | บันทึก health record (+ SHA-256 hash) |
| `GET` | `/records/:patient_id` | ดึง records ทั้งหมดของผู้ป่วย |

### AI Service — `:3001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/chat` | แชทกับ AI (single/all patient mode) |
| `POST` | `/chat/stream` | Streaming chat response |
| `POST` | `/embed` | สร้าง text embeddings |
| `POST` | `/vectorize` | Vectorize health record → Qdrant |

---

## 🤖 AI Agents

| Agent | Model | หน้าที่ |
|-------|-------|---------|
| **Chat Agent** | Llama 3.3 70B (Groq) | ตอบคำถามสุขภาพ + วิเคราะห์ข้อมูลผู้ป่วย |
| **RAG Engine** | Gemini Embedding (768D) | Semantic search ข้ามข้อมูลผู้ป่วยทั้งหมด |
| **Insights Agent** | Llama 3.3 70B | วิเคราะห์แนวโน้ม + แนะนำ risk factors |

> 📖 รายละเอียดเพิ่มเติมดู [docs/agents.md](docs/agents.md)

---

## ⚙️ Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | AI | Google Gemini API key (embeddings) |
| `GROQ_API_KEY` | AI | Groq API key (Llama 3.3 70B) |
| `QDRANT_URL` | AI | Qdrant vector database URL |
| `BACKEND_URL` | AI | Go backend URL |
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
| `patients` | ข้อมูลผู้ป่วย (id, name, dob, gender) |
| `health_records` | บันทึกสุขภาพ + SHA-256 data hash |
| `chat_history` | ประวัติการสนทนากับ AI |
| `audit_logs` | Audit trail สำหรับ compliance |

---

## 🛣️ Roadmap

- [ ] **Diagnosis Suggestion Agent** — แนะนำการวินิจฉัยจากอาการ
- [ ] **Drug Interaction Checker** — ตรวจสอบยาตีกัน
- [ ] **Appointment Scheduler** — ช่วยนัดหมาย
- [ ] **Voice Input Agent** — รับคำสั่งด้วยเสียง

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
