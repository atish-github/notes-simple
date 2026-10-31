#!/usr/bin/env bash
# ==============================================================================
# start-backend.sh
# Starts the Spring Boot backend API server.
# Optimized for Android Phone (Termux) and macOS/Linux.
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================="
echo "  Starting Notes Simple Backend"
echo "============================================="

# 1. Detect if running inside Android Termux
IS_TERMUX=false
if [ -n "$TERMUX_VERSION" ] || [ -d "/data/data/com.termux" ]; then
    IS_TERMUX=true
    echo "[Info] Environment detected: Android Termux"
fi

# 2. Check Java installation
if ! command -v java >/dev/null 2>&1; then
    echo "[Error] Java runtime not found."
    if [ "$IS_TERMUX" = true ]; then
        echo "[Hint] Install OpenJDK on Termux by running:"
        echo "       pkg install openjdk-21"
    else
        echo "[Hint] Ensure Java is installed and present in your PATH."
    fi
    exit 1
fi

JAVA_VERSION_OUTPUT=$(java -version 2>&1 | head -n 1)
echo "[Info] Using Java: $JAVA_VERSION_OUTPUT"

# 3. Check / Configure PostgreSQL or Fallback Profile
PROFILE_ARG=""

# Check if user explicitly passed --local / -l flag
if [ "$1" = "--local" ] || [ "$1" = "-l" ]; then
    echo "[Info] Using embedded local H2 database profile (--local)."
    PROFILE_ARG="-Dspring-boot.run.profiles=local"
else
    # Check if PostgreSQL is listening on port 5432
    PG_UP=false
    if command -v nc >/dev/null 2>&1 && nc -z 127.0.0.1 5432 2>/dev/null; then
        PG_UP=true
    elif command -v pg_isready >/dev/null 2>&1 && pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
        PG_UP=true
    fi

    if [ "$PG_UP" = true ]; then
        echo "[Info] PostgreSQL is running on port 5432."
    else
        echo "[Warn] PostgreSQL is not detected on port 5432."
        if [ "$IS_TERMUX" = true ]; then
            PG_DIR="$PREFIX/var/lib/postgresql"
            if command -v pg_ctl >/dev/null 2>&1 && [ -d "$PG_DIR" ]; then
                echo "[Info] Attempting to start PostgreSQL service in Termux..."
                pg_ctl -D "$PG_DIR" -l "$PREFIX/var/log/pgsql.log" start || true
                sleep 2
            fi
        fi

        # Retest after attempt
        if command -v nc >/dev/null 2>&1 && nc -z 127.0.0.1 5432 2>/dev/null; then
            echo "[Info] PostgreSQL started successfully."
        else
            echo "[Notice] PostgreSQL is not running. Automatically falling back to in-memory H2 profile."
            echo "         (Data will be kept in memory for this session without needing PostgreSQL)."
            echo "         To use PostgreSQL on Termux, run: pkg install postgresql && initdb && pg_ctl start"
            PROFILE_ARG="-Dspring-boot.run.profiles=local"
        fi
    fi
fi

# 4. Check if a pre-built JAR is available for faster startup
JAR_FILE="target/notes-simple-0.0.1-SNAPSHOT.jar"
if [ -f "$JAR_FILE" ] && [ "$1" != "--build" ]; then
    echo "[Info] Launching pre-built JAR: $JAR_FILE"
    if [ -n "$PROFILE_ARG" ]; then
        exec java -Dspring.profiles.active=local -jar "$JAR_FILE"
    else
        exec java -jar "$JAR_FILE"
    fi
fi

# 5. Build and run using Maven
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
