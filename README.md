# OfficeFlow

OfficeFlow is an internal task management platform for assigning, tracking, and monitoring office team work. It is built as a monorepo:

- `backend`: Java 21+, Spring Boot, Spring Security, Spring Data JPA, MySQL
- `frontend`: React, Vite, Tailwind CSS

## Product Features

- Organization registration with the first user becoming the organization admin
- Organization-scoped login using workspace slug, email, and password
- Tenant isolation across users, projects, tasks, comments, activity, and project membership
- Admin-created invitation links for adding users to an organization
- Role-aware users: admin, manager, member
- Manager/admin project creation and task management
- Project list with live task counts
- Workflow views for Summary, List, and Board
- Project-level member access: admins can promote a project user to Team Lead; Team Leads can manage members for that project
- Task assignment, priority, status, due dates, descriptions, comments, and activity history

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
$env:SERVER_PORT="8080"
```

### Backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`.

If port `8080` is already in use, set `SERVER_PORT` to another port and update `VITE_API_URL` in the frontend when you are not using the Vite proxy.

The unauthenticated entry flow starts by asking for the organization name:

1. If the organization does not exist, the user is sent to organization registration and must assign the first admin account.
2. If the organization exists, the user is sent to member signup for that organization, then asked to sign in.
3. Existing users can sign in with workspace slug, email, and password.
4. Admin invitation links still work through `/invite/{token}` for controlled onboarding.

The first account in each organization becomes its admin. Admins can invite team members from the app and share the generated invitation link.

Admins can invite members and manage organization access. Admins and managers can create projects and assign tasks. Selecting a user in the Team section lets an admin or project Team Lead grant `Project member`, `Team lead`, or `No access` for the currently selected project.

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

- Set `VITE_API_URL` to the deployed backend URL, or leave it empty when the frontend and backend are served behind the same origin or reverse proxy.
- Run `npm.cmd run build`.
- Deploy the generated `frontend/dist` folder.

No demo users or seed projects are created by the code.

## API Overview

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/member-signup`
- `GET /api/auth/invites/{token}`
- `POST /api/auth/invites/signup`
- `GET /api/organizations/lookup?name={organizationName}`
- `GET /api/invitations`
- `POST /api/invitations`
- `GET /api/users`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{projectId}/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}`
- `POST /api/tasks/{taskId}/comments`
