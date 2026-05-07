# OfficeFlow

OfficeFlow is an internal task management platform for assigning, tracking, and monitoring office team work. It is built as a monorepo:

- `backend`: Java 25, Spring Boot, Spring Security, Spring Data JPA, MySQL
- `frontend`: React, Vite, Tailwind CSS

## Features in this MVP

- Email/password login with bearer tokens
- Role-aware users: admin, manager, member
- Self-service signup with name, designation, office email, and password confirmation
- Admin user creation from the app
- Manager/admin project creation from the app
- Project list with live task counts
- Project-scoped task board
- Assignment-based visibility: admins see all projects and tasks; users only see projects and tasks assigned to them
- Project-level member access: admins can promote a project user to Team Lead; Team Leads can manage members for that project
- Task assignment, priority, status, due dates, and descriptions
- Comment threads per task
- Activity feed per task
- Production signup with admin access restricted to approved office emails

## Frontend Structure

- `frontend/src/pages`: route-level screens such as login and workspace
- `frontend/src/components`: reusable UI grouped by feature
- `frontend/src/components/board`: task board, columns, and task detail drawer
- `frontend/src/components/modals`: create/edit/access dialogs
- `frontend/src/components/common`: shared form controls and small UI blocks
- `frontend/src/components/badges`: small status/role badges
- `frontend/src/api`: API base URL and request helper
- `frontend/src/hooks`: React hooks such as authenticated API access
- `frontend/src/constants`: shared workflow constants
- `frontend/src/utils`: formatting/date helpers
- `frontend/src/assets`: static frontend assets

## Local Setup

### MySQL

Create a database:

```sql
CREATE DATABASE officeflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or start the included local MySQL container:

```powershell
docker compose up -d mysql
```

Set these environment variables if your local MySQL values differ from the defaults:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/officeflow?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="password"
$env:APP_TOKEN_SECRET="replace-this-with-a-long-random-secret"
```

### Backend

```powershell
cd backend
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

Ask users to create an account from the Signup page. Admin access is granted only to these office emails:

- `madan.garimella@sathyasoftechin.com`
- `vishnu.ippili@sathyasoftechin.com`
- `sathyareddy.md@sathyasoftechin.com`

Admin users can add team members, create projects, assign tasks, and manage project access from the Team section. Selecting a user in the Team section lets an admin grant `Project member`, `Team lead`, or `No access` for the currently selected project. Project Team Leads can manage members for that project.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

If PowerShell blocks `npm`, use `npm.cmd`:

```powershell
npm.cmd install
npm.cmd run dev
```

## Production Deployment

Backend production checklist:

- Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` for the production MySQL database.
- Set a long random `APP_TOKEN_SECRET`.
- Set `APP_CORS_ORIGINS` to the deployed frontend origin.
- Use `JPA_DDL_AUTO=update` for first deployment, then move to `validate` once the schema is stable.
- Run `mvn package -DskipTests` and deploy `backend/target/officeflow-backend-0.0.1-SNAPSHOT.jar`.

Frontend production checklist:

- Set `VITE_API_URL` to the deployed backend URL.
- Run `npm.cmd run build`.
- Deploy the generated `frontend/dist` folder.

The application removes the old local demo users ending in `@officeflow.local` on startup. No demo users or seed projects are created by the code.

## API Overview

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `GET /api/users`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{projectId}/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}`
- `POST /api/tasks/{taskId}/comments`
