#!/usr/bin/env bash
# ==============================================================================
# start-all.sh
# Starts both Backend and Frontend in the background with logging & health check.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

mkdir -p logs

echo "============================================="
echo "  Starting Notes Simple in Background"
echo "============================================="

# 1. Acquire Termux wake-lock if on Android
if command -v termux-wake-lock >/dev/null 2>&1; then
    echo "[Info] Acquiring Termux wake-lock..."
    termux-wake-lock || true
fi

# 2. Start Backend in background
BACKEND_PID=""
if [ -f .backend.pid ] && kill -0 "$(cat .backend.pid 2>/dev/null)" 2>/dev/null; then
    BACKEND_PID=$(cat .backend.pid)
    echo "[Info] Backend is already running (PID: $BACKEND_PID)"
else
    echo "[1/2] Starting Backend in background..."
    nohup ./start-backend.sh > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo "$BACKEND_PID" > .backend.pid
    echo "      Backend PID: $BACKEND_PID"
    echo "      Log file   : logs/backend.log"
fi

# 3. Start Frontend in background
FRONTEND_PID=""
if [ -f .frontend.pid ] && kill -0 "$(cat .frontend.pid 2>/dev/null)" 2>/dev/null; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "[Info] Frontend is already running (PID: $FRONTEND_PID)"
else
    echo "[2/2] Starting Frontend in background..."
    nohup ./start-frontend.sh > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "$FRONTEND_PID" > .frontend.pid
    echo "      Frontend PID: $FRONTEND_PID"
    echo "      Log file    : logs/frontend.log"
fi

# 4. Wait for Backend port 8080 to become ready
echo ""
echo "[Info] Waiting for Backend to be ready on port 8080..."
BACKEND_READY=false
for i in {1..35}; do
    if (bash -c "(echo > /dev/tcp/127.0.0.1/8080)" 2>/dev/null); then
        BACKEND_READY=true
        break
    fi

    # Check if backend process crashed
    if [ -n "$BACKEND_PID" ] && ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo ""
        echo "[Error] Backend process terminated prematurely!"
        echo "================ Backend Logs ================"
        tail -n 25 logs/backend.log 2>/dev/null || true
        echo "=============================================="
        exit 1
    fi
    sleep 1
done

echo ""
if [ "$BACKEND_READY" = true ]; then
    echo "============================================="
    echo "  Services Running & Ready!"
    echo "============================================="
    echo "  Backend API & App : http://localhost:8080"
    echo "  Frontend Dev UI   : http://localhost:5173"
    echo "  Swagger Docs      : http://localhost:8080/swagger-ui.html"
    echo ""
    echo "  From another device on your Wi-Fi:"
    echo "    http://<your-phone-ip>:8080"
    echo "    http://<your-phone-ip>:5173"
    echo ""
    echo "  View live logs: tail -f logs/backend.log"
    echo "  To stop services: ./stop-all.sh"
    echo "============================================="
else
    echo "[Warn] Backend is taking longer than usual to bind to port 8080."
    echo "       Check current progress with: tail -f logs/backend.log"
fi
