#!/usr/bin/env bash
# ==============================================================================
# start-frontend.sh
# Starts the React TypeScript Vite development server.
# Optimized for Android Phone (Termux) and macOS/Linux.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "============================================="
echo "  Starting Notes Simple Frontend"
echo "============================================="

# 1. Check if user asked for Docker mode
if [ "$1" = "--docker" ] || [ "$1" = "-d" ]; then
    echo "[Info] In Docker mode, the production React frontend is bundled directly"
    echo "       into the Spring Boot container and served at http://localhost:8080."
    echo "       To start the entire Docker stack, run:"
    echo "       ./start-backend.sh --docker"
    exit 0
fi

# 2. Detect if running inside Android Termux
IS_TERMUX=false
if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
    IS_TERMUX=true
    echo "[Info] Environment detected: Android Termux"
fi

# 3. Check Node.js and NPM installation
if ! command -v node >/dev/null 2>&1; then
    echo "[Error] Node.js is not found."
    if [ "$IS_TERMUX" = true ]; then
        echo "[Hint] Install Node.js on Termux by running:"
        echo "       pkg install nodejs"
    else
        echo "[Hint] Please ensure Node.js is installed."
    fi
    exit 1
fi

NODE_VERSION=$(node -v)
echo "[Info] Using Node.js: $NODE_VERSION"

cd "$FRONTEND_DIR"

# 4. Check node_modules dependencies
if [ ! -d "node_modules" ]; then
    echo "[Info] Installing frontend dependencies (npm install)..."
    npm install
fi

# 5. Handle --build flag
if [ "$1" = "--build" ] || [ "$1" = "-b" ]; then
    echo "[Info] Building production assets into Spring Boot static resources..."
    npm run build
    echo "[Success] Frontend build finished. Spring Boot will now serve it directly on port 8080."
    exit 0
fi

# 6. Start Vite Dev Server bound to 0.0.0.0
# Binding to 0.0.0.0 allows accessing the UI from your Android browser or another local device
echo "[Info] Starting Vite development server on 0.0.0.0:5173..."
exec npm run dev -- --host 0.0.0.0 --port 5173
