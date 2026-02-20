#!/bin/bash
# VanguardHealth v2 - Start All Services (Git Bash / WSL)

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "========================================"
echo "  VanguardHealth v2 - Starting Services"
echo "========================================"
echo ""

# Start Docker containers
echo "[1/4] Starting Docker containers..."
cd "$SCRIPT_DIR"
docker-compose up -d postgres qdrant
sleep 5

# Start Backend
echo "[2/4] Starting Go Backend..."
(cd "$SCRIPT_DIR/services/backend-go" && go run cmd/server/main.go) &
BACKEND_PID=$!
sleep 3

# Start AI Service
echo "[3/4] Starting AI Service..."
(cd "$SCRIPT_DIR/services/ai-node" && npm run dev) &
AI_PID=$!
sleep 3

# Start Frontend
echo "[4/4] Starting Frontend..."
(cd "$SCRIPT_DIR/services/web-nextjs" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  All services started!"
echo "========================================"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:50051"
echo "  AI:        http://localhost:3001"
echo "  Qdrant:    http://localhost:6333/dashboard"
echo ""
echo "  Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID $AI_PID $FRONTEND_PID 2>/dev/null
    cd "$SCRIPT_DIR"
    docker-compose stop postgres qdrant
    echo "Done!"
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
