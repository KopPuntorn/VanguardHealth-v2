# VanguardHealth v2

🏥 **Secure Medical Data Platform** with AI-powered insights

## Architecture

```
services/
├── web-nextjs/       # Frontend: Next.js 14 + Tailwind CSS
├── ai-node/          # AI Service: LangGraph + Gemini API
└── backend-go/       # Backend: Go Echo + PostgreSQL

shared/
└── proto/            # gRPC Protocol Buffers

scripts/
└── init-db.sql       # Database Schema
```

## Quick Start

### 1. Start Infrastructure
```bash
docker-compose up -d postgres qdrant
```

### 2. Run Backend (Go)
```bash
cd services/backend-go
go mod tidy
go run cmd/server/main.go
```

### 3. Run AI Service (Node.js)
```bash
cd services/ai-node
npm install
npm run dev
```

### 4. Run Frontend (Next.js)
```bash
cd services/web-nextjs
npm install
npm run dev
```

### 5. Access Dashboard
Open http://localhost:3000

## API Endpoints

### Backend (Port 50051)
- `GET /health` - Health check
- `POST /patients` - Create patient
- `GET /patients/:id` - Get patient
- `POST /ingest` - Store health record
- `GET /records/:patient_id` - Get patient records

### AI Service (Port 3001)
- `GET /health` - Health check
- `POST /chat` - Chat with AI
- `POST /chat/stream` - Streaming chat
- `POST /embed` - Generate embeddings

## Environment Variables

```env
# .env
GEMINI_API_KEY=your_api_key
```

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **AI**: LangGraph, Google Gemini, Qdrant
- **Backend**: Go, Echo, PostgreSQL
- **Infrastructure**: Docker, gRPC
