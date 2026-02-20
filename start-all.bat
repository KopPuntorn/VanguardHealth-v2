@echo off
title VanguardHealth v2 - All Services
echo.
echo ========================================
echo   VanguardHealth v2 - Starting All Services
echo ========================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running! Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/4] Starting Docker containers (Postgres + Qdrant)...
docker-compose up -d postgres qdrant
timeout /t 5 /nobreak >nul

echo [2/4] Starting Go Backend (port 50051)...
start "VanguardHealth Backend" cmd /c "cd services\backend-go && go run cmd\server\main.go"
timeout /t 3 /nobreak >nul

echo [3/4] Starting AI Service (port 3001)...
start "VanguardHealth AI" cmd /c "cd services\ai-node && npm run dev"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Next.js Frontend (port 3000)...
start "VanguardHealth Frontend" cmd /c "cd services\web-nextjs && npm run dev"

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:50051
echo   AI:        http://localhost:3001
echo   Qdrant:    http://localhost:6333/dashboard
echo.
echo   Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WindowTitle eq VanguardHealth*" /F >nul 2>&1
docker-compose stop postgres qdrant
echo Done!
