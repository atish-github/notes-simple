#!/usr/bin/env bash
# ==============================================================================
# start-backend.sh
# Starts the Spring Boot backend API server.
# Supports Docker Compose, Android Termux, and macOS/Linux native environments.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================="
echo "  Starting Notes Simple Backend"
echo "============================================="

# ------------------------------------------------------------------------------
# 1. Check if user wants full Docker deployment (--docker)
# ------------------------------------------------------------------------------
if [ "$1" = "--docker" ] || [ "$1" = "-d" ]; then
    echo "[Info] Launching full application stack using Docker Compose..."
    if ! command -v docker >/dev/null 2>&1; then
        echo "[Error] Docker is not installed or not in PATH."
        exit 1
    fi
    docker compose up --build -d
    echo "[Success] Containers started. Backend and frontend available at http://localhost:8080"
    echo "[Info] Streaming logs (press Ctrl+C to exit log view):"
    exec docker compose logs -f
fi

# ------------------------------------------------------------------------------
# 2. Detect Environment (Termux vs Desktop)
# ------------------------------------------------------------------------------
IS_TERMUX=false
if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
    IS_TERMUX=true
    echo "[Info] Environment detected: Android Termux"
fi

# ------------------------------------------------------------------------------
# 3. Smart Database Setup (Docker -> Native Postgres -> Termux -> In-memory H2)
# ------------------------------------------------------------------------------
PROFILE_ARG=""

if [ "$1" = "--local" ] || [ "$1" = "-l" ]; then
    echo "[Info] Using embedded local H2 database profile (--local)."
    PROFILE_ARG="-Dspring-boot.run.profiles=local"
else
    # Check if PostgreSQL is reachable on 5432
    is_postgres_up() {
        if command -v nc >/dev/null 2>&1 && nc -z 127.0.0.1 5432 2>/dev/null; then
            return 0
        elif command -v pg_isready >/dev/null 2>&1 && pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
            return 0
        fi
        return 1
    }

    if is_postgres_up; then
        echo "[Info] PostgreSQL is active on port 5432."
    else
        echo "[Warn] PostgreSQL not detected on port 5432."

        # Attempt A: If Docker is available and running, spin up Postgres via docker compose
        if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
            echo "[Info] Docker detected! Starting PostgreSQL container via docker compose..."
            docker compose up -d postgres
            echo "[Info] Waiting for PostgreSQL container to be ready..."
            for i in {1..15}; do
                if is_postgres_up; then
                    echo "[Info] PostgreSQL container is ready!"
                    break
                fi
                sleep 1
            done
        fi

        # Attempt B: If in Termux, try starting native Termux PostgreSQL service
        if [ "$IS_TERMUX" = true ] && ! is_postgres_up; then
            PG_DIR="$PREFIX/var/lib/postgresql"
            if command -v pg_ctl >/dev/null 2>&1 && [ -d "$PG_DIR" ]; then
                echo "[Info] Attempting to start PostgreSQL service in Termux (pg_ctl)..."
                pg_ctl -D "$PG_DIR" -l "$PREFIX/var/log/pgsql.log" start || true
                sleep 2
            fi
        fi

        # Final Check: If still not up, fallback to embedded H2
        if ! is_postgres_up; then
            echo "[Notice] PostgreSQL is not running. Automatically falling back to in-memory H2 profile."
            echo "         (Data will be stored in-memory without needing a separate database service)."
            echo "         To run with PostgreSQL, start Docker or use: pkg install postgresql on Termux."
            PROFILE_ARG="-Dspring-boot.run.profiles=local"
        fi
    fi
fi

# ------------------------------------------------------------------------------
# 4. Check Java Runtime
# ------------------------------------------------------------------------------
if ! command -v java >/dev/null 2>&1; then
    echo "[Error] Java runtime not found."
    if [ "$IS_TERMUX" = true ]; then
        echo "[Hint] Install OpenJDK on Termux by running:"
        echo "       pkg install openjdk-21"
    else
        echo "[Hint] Ensure Java 21+ is installed and present in your PATH."
    fi
    exit 1
fi

JAVA_VERSION_OUTPUT=$(java -version 2>&1 | head -n 1)
echo "[Info] Using Java: $JAVA_VERSION_OUTPUT"

# ------------------------------------------------------------------------------
# 5. Launch Backend (Pre-built JAR or Maven)
# ------------------------------------------------------------------------------
JAR_FILE="target/notes-simple-0.0.1-SNAPSHOT.jar"
if [ -f "$JAR_FILE" ] && [ "$1" != "--build" ]; then
    echo "[Info] Launching pre-built JAR: $JAR_FILE"
    if [ -n "$PROFILE_ARG" ]; then
        exec java -Dspring.profiles.active=local -jar "$JAR_FILE"
    else
        exec java -jar "$JAR_FILE"
    fi
fi

# Fallback to Maven
if command -v mvn >/dev/null 2>&1; then
    MVN_CMD="mvn"
elif [ -x "./mvnw" ]; then
    MVN_CMD="./mvnw"
else
    echo "[Error] Neither 'mvn' nor executable './mvnw' found."
    if [ "$IS_TERMUX" = true ]; then
        echo "[Hint] Install maven by running: pkg install maven"
    fi
    exit 1
fi

echo "[Info] Executing: $MVN_CMD spring-boot:run $PROFILE_ARG"
exec $MVN_CMD spring-boot:run $PROFILE_ARG
