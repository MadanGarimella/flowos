# FlowOS

FlowOS is a multi-tenant work operating system for teams across industries. It helps organizations manage projects, recurring operations, tasks, access, approvals, deadlines, audit history, and team accountability from one workspace.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Java 21+, Spring Boot, Spring Security, Spring Data JPA
- Database: MySQL

## Current Product Features

- Organization registration with the first user becoming organization admin
- Organization-scoped login using workspace slug, email, and password
- Invitation-only onboarding for existing workspaces
- Tenant isolation across users, projects, tasks, comments, activity, audit logs, and memberships
- Roles: admin, manager, member, and project Team Lead
- Cross-sector organization categories and project types
- Projects with client/department, confidentiality, billing model, and reference ID
- Tasks with assignment, priority, status, due date, deliverable type, approval stage, target/compliance date, and estimated hours
- Project file sharing with authenticated upload, download, and controlled deletion
- Clickable company directory profiles from the workspace sidebar
- Summary, list, board, drag-and-drop workflow, comments, and task activity
- User offboarding with task reassignment
- Admin-only organization audit trail
- Health endpoint for field testing and deployment checks

## Local Setup

Create a database:

```sql
CREATE DATABASE flowos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use Docker:

```powershell
docker compose up -d mysql
```

Start backend:

```powershell
cd backend
$env:DB_PASSWORD="your-password"
$env:APP_TOKEN_SECRET="replace-this-with-a-long-random-secret"
$env:APP_CORS_ORIGINS="http://localhost:5173,http://192.168.93.1:5173"
.\mvnw.cmd spring-boot:run
```

Start frontend:

```powershell
cd frontend
$env:VITE_API_MODE="local"
$env:VITE_ALLOWED_HOSTS="all"
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://localhost:5173
```

LAN testing:

```text
http://<your-lan-ip>:5173
http://<your-lan-ip>:8080/api/health
```

## Production Build

Backend:

```powershell
cd backend
.\mvnw.cmd clean package -DskipTests
```

Artifact:

```text
backend/target/flowos-backend-0.0.1-SNAPSHOT.jar
```

Frontend:

```powershell
cd frontend
$env:VITE_API_MODE="remote"
$env:VITE_API_URL="https://api.your-domain.com"
npm.cmd run build
```

Deploy:

```text
frontend/dist
```

## Production Environment

Required backend settings:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
APP_TOKEN_SECRET
APP_CORS_ORIGINS
APP_OPEN_MEMBER_SIGNUP=false
APP_UPLOAD_DIR=/var/lib/flowos/uploads
MAX_FILE_SIZE=25MB
MAX_REQUEST_SIZE=25MB
JPA_DDL_AUTO=validate
SERVER_PORT
```

Required frontend settings:

```text
VITE_API_MODE=remote
VITE_API_URL=https://api.your-domain.com
```

## Operational Requirements

Before customer onboarding:

- Use HTTPS for frontend and backend.
- Store secrets in the deployment platform, never in source control.
- Configure automated MySQL backups and tested restore procedures.
- Mount `APP_UPLOAD_DIR` on persistent storage and include it in backup procedures.
- Configure uptime monitoring for `/api/health`.
- Restrict CORS to deployed frontend origins.
- Keep open member signup disabled.
- Configure SMTP before enabling email invitations and password-reset flows.
- Review [Migration Guide](docs/MIGRATION_GUIDE.md).
- Review [Production Readiness](docs/PRODUCTION_READINESS.md).
- Track future modules in [Enterprise Roadmap](docs/ENTERPRISE_ROADMAP.md).

## API Overview

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/auth/invites/{token}`
- `POST /api/auth/invites/signup`
- `GET /api/auth/me`
- `GET /api/organizations/lookup?name={organizationName}`
- `GET /api/invitations`
- `POST /api/invitations`
- `GET /api/users`
- `POST /api/users/{userId}/offboard`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{projectId}/tasks`
- `GET /api/projects/{projectId}/members`
- `GET /api/projects/{projectId}/files`
- `POST /api/projects/{projectId}/files`
- `GET /api/files/{fileId}/download`
- `DELETE /api/files/{fileId}`
- `POST /api/tasks`
- `GET /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}`
- `POST /api/tasks/{taskId}/comments`
- `GET /api/audit`

## Brand

FlowOS uses the official FlowOS logo stored at:

```text
frontend/public/flowos-logo.png
```
