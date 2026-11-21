# HASEB Distribution Core — starter package

This is a starter implementation package for the internal food distribution system.
It is not production-ready. Build and test it in GitHub Codespaces before operational use.

## Stack
- .NET 10 / ASP.NET Core
- PostgreSQL
- React + TypeScript + Vite
- Docker Compose

## Run in Codespaces or on a machine with Docker
```bash
docker compose up --build
```
Web: http://localhost:5173
API: http://localhost:8080/health

Initial scope: API health endpoint and Persian RTL frontend shell.
The full purchasing, sales, accounting, stock, permissions, audit, and migration workflows
must be implemented and tested in subsequent increments.
