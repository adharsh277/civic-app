# Civic Issue Reporter

Modern full-stack SaaS-style platform for environmental cleanliness issue reporting.

## Project Structure

- frontend: React + TypeScript + Tailwind + React Router
- backend: Node.js + Express + TypeScript (in-memory storage)

## Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at http://localhost:5000.

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173.

## Available API Endpoints

- `POST /report` create a report with default status `Pending`
- `GET /reports` list all reports
- `PATCH /reports/:id/status` update report status
- `GET /health` service health check

Note: Reports are stored in memory and reset when the backend restarts.