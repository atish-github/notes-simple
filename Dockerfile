# ==============================================================================
# Multi-stage Dockerfile for Notes Simple (Spring Boot + React TS)
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot Executable JAR
FROM maven:3.9.9-eclipse-temurin-21-alpine AS backend-builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Copy built frontend static assets into Spring Boot static resources
COPY --from=frontend-builder /app/src/main/resources/static ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Minimal Production Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=backend-builder /app/target/notes-simple-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENV SERVER_PORT=8080 \
    SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/notes_db \
    SPRING_DATASOURCE_USERNAME=postgres \
    SPRING_DATASOURCE_PASSWORD=postgres

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
