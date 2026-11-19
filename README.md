# Employee Directory

A full-stack employee management app: add, view, search, edit and delete employees.

- **Frontend:** React 18 + TypeScript (Vite), Axios, plain CSS
- **Backend:** Node.js + Express REST API
- **Database:** PostgreSQL

```
employee-directory/
├── backend/    # Express API + PostgreSQL schema
└── frontend/   # React + TypeScript (Vite) app
```

## Features

- Add, edit and delete employees (name, email, role) via modal forms with inline validation
- Dashboard stat cards (total, unique roles, new this week, most common role)
- Debounced server-side search by name, role filter and sortable columns
- Pagination with page numbers
- Light / dark theme (remembers your choice), loading skeletons, toast notifications, delete confirmation
- Validation on client and server, duplicate-email handling (HTTP 409)
- Responsive, accessible UI (keyboard, ARIA labels), CORS enabled

## Prerequisites

- Node.js 18+
- PostgreSQL 13+ running locally

## Run locally

### 1. Database

```bash
createdb employee_directory
```

(Or create a database named `employee_directory` from pgAdmin.) The `employees` table is created automatically when the API starts, using `backend/schema.sql`.

### 2. Backend

```bash
cd backend
cp .env.example .env     # edit DATABASE_URL with your Postgres credentials
npm install
npm run dev              # http://localhost:5000
npm run seed             # optional: load 12 sample employees
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm install
npm run dev              # http://localhost:5173
```

Open http://localhost:5173.

## API

| Method | Endpoint          | Description                                     |
| ------ | ----------------- | ----------------------------------------------- |
| GET    | `/employees`      | List employees. Query: `search`, `role`, `sort` (`name`/`role`/`created_at`), `order` (`asc`/`desc`), `page`, `limit` |
| GET    | `/employees/meta` | Dashboard stats and distinct roles              |
| POST   | `/employees`      | Create an employee                              |
| PUT    | `/employees/:id`  | Update an employee                              |
| DELETE | `/employees/:id`  | Delete an employee                              |

`GET /employees` returns:

```json
{ "data": [...], "total": 12, "page": 1, "limit": 10, "totalPages": 2 }
```

Request body for POST/PUT:

```json
{ "name": "Jane Doe", "email": "jane@company.com", "role": "Engineer" }
```

## Database schema

```sql
CREATE TABLE employees (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  role       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

## Deployment (optional)

- **Frontend → GitHub Pages:** the app is static. Build with
  `VITE_API_URL=<your deployed API> VITE_BASE=/<repo-name>/ npm run build` and publish `frontend/dist` to the `gh-pages` branch.
- **Backend:** deploy to Render / Railway with a managed PostgreSQL; set `DATABASE_URL` and `CORS_ORIGIN` (your GitHub Pages URL).
