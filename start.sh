#!/bin/bash
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Eski processler durduruluyor ==="
pkill -f "uvicorn app.main" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

echo "=== PostgreSQL başlatılıyor (port 5433) ==="
cd "$ROOT" && docker-compose up -d

echo "=== Backend başlatılıyor (port 8001) ==="
cd "$ROOT/backend" && source venv/bin/activate && uvicorn app.main:app --reload --port 8001 &

echo "=== Frontend başlatılıyor (port 5174) ==="
cd "$ROOT/frontend" && npm run dev &

echo ""
echo "Uygulama : http://localhost:5174"
echo "API Docs : http://localhost:8001/docs"

wait
