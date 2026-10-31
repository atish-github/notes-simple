# Notes Simple (Full-Stack Spring Boot 25 + React TypeScript)

A modern full-stack notes workspace featuring:
- **Backend**: Java 25 & Spring Boot 3.4 API server with stateless JWT authentication (tokens valid for 24 hours), PostgreSQL persistence, XSS sanitization, and OpenAPI 3 / Swagger documentation.
- **Frontend**: Mobile-first React with TypeScript, bundled directly inside the Java project (`frontend/`), with a greyish glassmorphism aesthetic, zig-zag stacked cards lying on a desk, and seamless SPA serving by Spring Boot.
- **Security**: Cryptographically strong BCrypt hashing (strength 12), Jsoup HTML sanitization for note content against XSS attacks, and strict user-level data isolation (`created_by`).

---

## 🛠 Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Backend** | Spring Boot 3.4.1 (Java 25) | Web, Security, Data JPA, Validation |
| **Authentication** | JJWT (io.jsonwebtoken 0.12.6) | 24-hour expiration (`86,400,000 ms`), HMAC-SHA256 |
| **Database** | PostgreSQL 16 (or H2 local profile) | Dockerized Postgres with `docker-compose.yml` |
| **XSS Protection**| Jsoup 1.18.1 | Java-level sanitization on note content |
| **Documentation** | SpringDoc OpenAPI 3.0 / Swagger UI | Accessible at `/swagger-ui.html` and `/v3/api-docs` |
| **Frontend** | React 18 + TypeScript + Vite | Packaged inside `frontend/`, served from `/static` |
| **Design / UI** | Mobile-first Glassmorphic Stacks | Greyish palette, risen shadows, zig-zag notes lying on desk |

---

## 🔑 Default Seed Account

When the backend starts up, it automatically creates the default administrator account if it does not already exist:

| Field | Value |
|---|---|
| **Email (Username)** | `atishsharma11@gmail.com` |
| **Password** | `qwerty@123` *(stored as cryptographically strong BCrypt hash)* |
| **Preferred Name** | `Atish` |
| **Role** | `ROLE_ADMIN` |

*Note: The frontend login screen also includes a one-click **"Fill default user (Atish)"** button for testing.*

---

## 🗄 Database Entities

### 1. `users` Table
- `uuid`: Primary key (UUID, auto-generated)
- `preferred_name`: Display name (e.g., `Atish`)
- `email`: Validated email (regex-enforced on frontend and backend), unique, serves as username
- `password`: BCrypt hash (strength 12)
- `role`: `ROLE_ADMIN` | `ROLE_USER`
- `created_at`, `updated_at`: Timestamps

### 2. `notes_groups` Table
- `uuid`: Primary key (UUID)
- `group_id`: Incrementally updating number (`Long`) per user
- `group_name`: Optional group label
- `created_by`: UUID of the owner (tied to logged-in user)
- `created_at`: Timestamp

### 3. `notes` Table
- `uuid`: Primary key (UUID)
- `note`: Text content (**strictly sanitized at the Java level against XSS vulnerabilities**)
- `group_uuid`: Reference to `notes_groups`
- `status`: `active` | `archived`
- `created_by`: UUID of the owner (tied to logged-in user)
- `created_at`, `updated_at`: Timestamps

---

## 📱 Running on Android Phone via Termux

You can run both backend and frontend directly on your Android device using [Termux](https://termux.dev):

### 1. Install prerequisites in Termux:
```bash
pkg update
pkg install git openjdk-21 nodejs maven postgresql
```

### 2. Clone the repository:
```bash
git clone https://github.com/atish-github/notes-simple.git
cd notes-simple
```

### 3. Start Backend:
```bash
./start-backend.sh
```
*(If PostgreSQL is not running in Termux, the script automatically uses the embedded in-memory H2 profile so you don't even need to configure a database!)*

### 4. Start Frontend (Optional for dev hot-reload):
```bash
./start-frontend.sh
```
*(Bound to `0.0.0.0:5173` so you can open it in Chrome on your phone or on any other device on your local Wi-Fi).*

---

## 🚀 Quick Start Guide

### 1. Start PostgreSQL with Docker Compose
Run the following in the project root:
```bash
docker compose up -d
```
This spins up PostgreSQL 16 on port `5432` with database `notes_db`, user `postgres`, and password `password`.

*(Optional: If you do not have Docker installed, you can run Spring Boot with the `local` profile to use the embedded H2 database without any external dependencies)*:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### 2. Build the Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```
The built React assets will be written directly into `src/main/resources/static/`, allowing the Spring Boot server to serve the frontend!

### 3. Run the Backend API & Frontend Server
```bash
./mvnw spring-boot:run
```
Once started:
- **Application & UI**: [http://localhost:8080](http://localhost:8080)
- **Swagger / OpenAPI Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 💻 Frontend Development Mode (Hot Reload)

For frontend development with hot-module replacement (Vite):
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). Requests to `/api/*` are automatically proxied to the Spring Boot backend on `http://localhost:8080`.

---

## 🎨 UI & UX Design Features

- **Common Theme Place**: Colors, glass filters, elevated shadows, and typography are defined in `frontend/src/styles/theme.css` via standard CSS variables.
- **Glassmorphic Elevation**: Risen card shadows (`--card-shadow-risen`) and translucent backdrop blur create the effect of glass cards floating above the container.
- **Zig-Zag Stacking**: Notes within the same group can be viewed in a physical zig-zag stack layout with slight rotational offsets (alternating angles like real papers on a desk) and swipe/prev/next controls, or spread out into an expanded desk view.
- **In-Card Edit Transition**: Clicking **Edit** transitions the note from italic non-editable text into a textarea right inside that card with Save & Cancel buttons.
- **Dynamic Floating '+' Button**: The '+' button is displayed while in read mode, and **automatically hides whenever any card switches to edit mode**.
- **Group '+' Button**: Each note card and stack header features an **Add** button to quickly append a new note to that specific group.
- **Stateless 24h Session**: The JWT token returned on login is stored and included in all API calls via `Authorization: Bearer <token>`, with an instant **Logout** button.

---

## 📦 Building Single Unified Executable JAR

To package the entire full-stack application (frontend + backend) into a single standalone JAR:
```bash
# 1. Build frontend
cd frontend && npm run build && cd ..

# 2. Package Spring Boot JAR
./mvnw clean package -DskipTests

# 3. Run the executable JAR
java -jar target/notes-simple-0.0.1-SNAPSHOT.jar
```
Visit [http://localhost:8080](http://localhost:8080) — both API and UI run seamlessly in one process!

