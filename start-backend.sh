#!/usr/bin/env bash
# ==============================================================================
# start-backend.sh
# Starts the Spring Boot backend API server with automated PostgreSQL setup.
# Fully automated for Android Phone (Termux), Docker, and macOS/Linux.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================="
echo "  Starting Notes Simple Backend"
echo "============================================="

# ------------------------------------------------------------------------------
# 1. Full Docker deployment check (--docker / -d)
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
# 2. Detect Environment
# ------------------------------------------------------------------------------
IS_TERMUX=false
if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
    IS_TERMUX=true
    echo "[Info] Environment detected: Android Termux"
fi

# Port check function (uses bash built-in /dev/tcp - requires no netcat or external tools)
is_postgres_up() {
    (timeout 1 bash -c "</dev/tcp/127.0.0.1/5432" 2>/dev/null) || \
    (bash -c "(echo > /dev/tcp/127.0.0.1/5432)" 2>/dev/null)
}

# ------------------------------------------------------------------------------
# 3. Automated PostgreSQL Setup & Lifecycle
# ------------------------------------------------------------------------------
PROFILE_ARG=""

if [ "$1" = "--local" ] || [ "$1" = "-l" ]; then
    echo "[Info] Explicit local flag detected: using embedded in-memory H2 database."
    PROFILE_ARG="-Dspring-boot.run.profiles=local"
else
    # ----------------------------------------------------
    # Case A: Android Termux automated PostgreSQL setup
    # ----------------------------------------------------
    if [ "$IS_TERMUX" = true ]; then
        # 1. Ensure PostgreSQL is installed in Termux
        if ! command -v initdb >/dev/null 2>&1 || ! command -v pg_ctl >/dev/null 2>&1; then
            echo "[Info] Installing PostgreSQL in Termux (pkg install -y postgresql)..."
            pkg install -y postgresql || true
        fi

        PG_DATA="${PREFIX:-/data/data/com.termux/files/usr}/var/lib/postgresql"
        PG_LOG_DIR="${PREFIX:-/data/data/com.termux/files/usr}/var/log"

        # 2. Initialize database cluster if not already done
        if command -v initdb >/dev/null 2>&1; then
            if [ ! -f "$PG_DATA/PG_VERSION" ]; then
                echo "[Info] Initializing PostgreSQL database cluster in Termux..."
                mkdir -p "$PG_DATA"
                mkdir -p "$PG_LOG_DIR"
                initdb -D "$PG_DATA" --auth-local=trust --auth-host=trust || initdb -D "$PG_DATA" || true
            fi
        fi

        # 3. Start PostgreSQL server if not currently running
        if ! is_postgres_up; then
            if command -v pg_ctl >/dev/null 2>&1 && [ -f "$PG_DATA/PG_VERSION" ]; then
                echo "[Info] Starting PostgreSQL service in Termux..."
                mkdir -p "$PG_LOG_DIR"
                pg_ctl -D "$PG_DATA" -l "$PG_LOG_DIR/postgresql.log" -w start || pg_ctl -D "$PG_DATA" -l "$PG_LOG_DIR/postgresql.log" start || true
                sleep 2
            fi
        fi

        # 4. Ensure 'postgres' user with password 'postgres' and database 'notes_db' exist
        if is_postgres_up; then
            echo "[Info] Ensuring PostgreSQL 'postgres' user and 'notes_db' database exist..."
            psql -h 127.0.0.1 -d postgres -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;" 2>/dev/null || \
            psql -d postgres -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;" 2>/dev/null || \
            psql -d postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || true

            psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE notes_db OWNER postgres;" 2>/dev/null || \
            psql -d postgres -c "CREATE DATABASE notes_db OWNER postgres;" 2>/dev/null || \
            createdb notes_db 2>/dev/null || true
        fi

    # ----------------------------------------------------
    # Case B: Desktop (Docker / Native Postgres)
    # ----------------------------------------------------
    else
        if ! is_postgres_up; then
            if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
                echo "[Info] Docker detected. Starting PostgreSQL container via docker compose..."
                docker compose up -d postgres
                for i in 1 2 3 4 5 6 7 8 9 10; do
                    if is_postgres_up; then
                        break
                    fi
                    sleep 1
                done
            fi
        fi
    fi

    # ----------------------------------------------------
    # Verification
    # ----------------------------------------------------
    if is_postgres_up; then
        echo "[Success] PostgreSQL is running on port 5432! Using PostgreSQL database."
    else
        echo "[Warn] Could not start or connect to PostgreSQL on port 5432."
        echo "       Falling back to embedded in-memory H2 profile."
        echo "       (To run PostgreSQL on Termux manually: 'pkg install postgresql && initdb $PREFIX/var/lib/postgresql && pg_ctl -D $PREFIX/var/lib/postgresql start')"
        PROFILE_ARG="-Dspring-boot.run.profiles=local"
    fi
fi

# ------------------------------------------------------------------------------
# 4. Check Java Runtime
# ------------------------------------------------------------------------------
if ! command -v java >/dev/null 2>&1; then
    echo "[Error] Java runtime not found."
    if [ "$IS_TERMUX" = true ]; then
        echo "[Hint] Install OpenJDK on Termux by running:"
        echo "       pkg install -y openjdk-21"
    else
        echo "[Hint] Ensure Java 21+ is installed and present in your PATH."
    fi
    exit 1
fi

JAVA_VERSION_OUTPUT=$(java -version 2>&1 | head -n 1)
echo "[Info] Using Java: $JAVA_VERSION_OUTPUT"

# ------------------------------------------------------------------------------
# 5. Launch Spring Boot
# ------------------------------------------------------------------------------
JAR_FILE="target/notes-simple-0.0.1-SNAPSHOT.jar"
if [ -f "$JAR_FILE" ] && [ "$1" != "--build" ]; then
    # Invalidate stale jar if any source files or pom.xml are newer than the jar
    NEWER_SOURCES=$(find src pom.xml -newer "$JAR_FILE" 2>/dev/null | head -n 1 || true)
    if [ -n "$NEWER_SOURCES" ]; then
        echo "[Info] Code updates detected ($NEWER_SOURCES). Recompiling..."
        rm -f "$JAR_FILE"
    else
        echo "[Info] Launching pre-built JAR: $JAR_FILE"
        if [ -n "$PROFILE_ARG" ]; then
            exec java -Dspring.profiles.active=local -jar "$JAR_FILE"
        else
            exec java -jar "$JAR_FILE"
        fi
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
        echo "[Hint] Install maven by running: pkg install -y maven"
    fi
    exit 1
fi

echo "[Info] Executing: $MVN_CMD spring-boot:run $PROFILE_ARG"
exec $MVN_CMD spring-boot:run $PROFILE_ARG
