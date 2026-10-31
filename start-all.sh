#!/usr/bin/env bash
# ==============================================================================
# start-all.sh
# Starts both Backend and Frontend in the background with logging & PID tracking.
# Optimized for Android Phone (Termux) and macOS/Linux.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p logs

echo "============================================="
echo "  Starting Notes Simple in Background"
echo "============================================="

# 1. Acquire Termux wake-lock if on Android (prevents Android OS from sleeping CPU)
if command -v termux-wake-lock >/dev/null 2>&1; then
    echo "[Info] Acquiring Termux wake-lock (keeps background CPU alive)..."
    termux-wake-lock || true
fi

# 2. Start Backend in background
if [ -f .backend.pid ] && kill -0 "$(cat .backend.pid 2>/dev/null)" 2>/dev/null; then
    echo "[Info] Backend is already running (PID: $(cat .backend.pid))"
else
    echo "[1/2] Starting Backend in background..."
    nohup ./start-backend.sh > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "$BACKEND_PID" > .backend.pid
    echo "      Backend PID: $BACKEND_PID"
    echo "      Log file   : logs/backend.log"
fi

# 3. Start Frontend in background
if [ -f .frontend.pid ] && kill -0 "$(cat .frontend.pid 2>/dev/null)" 2>/dev/null; then
    echo "[Info] Frontend is already running (PID: $(cat .frontend.pid))"
else
    echo "[2/2] Starting Frontend in background..."
    nohup ./start-frontend.sh > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "$FRONTEND_PID" > .frontend.pid
    echo "      Frontend PID: $FRONTEND_PID"
    echo "      Log file    : logs/frontend.log"
fi

echo ""
echo "============================================="
echo "  Services Running in Background!"
echo "============================================="
echo "  Spring Boot & App : http://localhost:8080"
echo "  Frontend Dev UI   : http://localhost:5173"
echo "  OpenAPI / Swagger : http://localhost:8080/swagger-ui.html"
echo ""
echo "  View live logs:"
echo "    tail -f logs/backend.log"
echo "    tail -f logs/frontend.log"
echo ""
echo "  To stop all services:"
echo "    ./stop-all.sh"
echo "============================================="
