#!/usr/bin/env bash
# ==============================================================================
# stop-all.sh
# Stops background Backend and Frontend processes cleanly.
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================="
echo "  Stopping Background Services"
echo "============================================="

stop_by_pid_file() {
    SERVICE_NAME=$1
    PID_FILE=$2

    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE" 2>/dev/null || true)
        if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
            echo "[Info] Stopping $SERVICE_NAME (PID: $PID)..."
            kill "$PID" 2>/dev/null || true
            for i in {1..5}; do
                if ! kill -0 "$PID" 2>/dev/null; then
                    break
                fi
                sleep 1
            done
            if kill -0 "$PID" 2>/dev/null; then
                echo "[Warn] Force stopping $SERVICE_NAME..."
                kill -9 "$PID" 2>/dev/null || true
            fi
            echo "[Success] $SERVICE_NAME stopped."
        else
            echo "[Info] $SERVICE_NAME is not currently running."
        fi
        rm -f "$PID_FILE"
    fi
}

stop_by_pid_file "Backend" ".backend.pid"
stop_by_pid_file "Frontend" ".frontend.pid"

# Fallback cleanup by ports if any orphaned process remains
if command -v lsof >/dev/null 2>&1; then
    PORT_8080_PID=$(lsof -ti :8080 2>/dev/null || true)
    if [ -n "$PORT_8080_PID" ]; then
        echo "[Info] Releasing port 8080 (PID: $PORT_8080_PID)..."
        kill -9 $PORT_8080_PID 2>/dev/null || true
    fi

    PORT_5173_PID=$(lsof -ti :5173 2>/dev/null || true)
    if [ -n "$PORT_5173_PID" ]; then
        echo "[Info] Releasing port 5173 (PID: $PORT_5173_PID)..."
        kill -9 $PORT_5173_PID 2>/dev/null || true
    fi
fi

# Release Termux wake-lock if on Android
if command -v termux-wake-unlock >/dev/null 2>&1; then
    termux-wake-unlock || true
    echo "[Info] Termux wake-lock released."
fi

echo "============================================="
echo "  All background services stopped."
echo "============================================="
