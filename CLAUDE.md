# Aluguel Motos - Project Documentation

## Project Overview
Full-stack application for motorcycle rental management. Monorepo with Spring Boot backend and Next.js frontend.

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.14
- **Language**: Java 21
- **Database**: PostgreSQL (running in Docker)
  - Host: localhost:5432
  - Database: aluguel-moto
  - User: postgres
  - Password: lucas123
- **ORM**: Spring Data JPA + Hibernate
- **Build**: Maven
- **Dev Tools**: Lombok, Spring Boot DevTools

### Frontend
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Node Version**: Compatible with current LTS

## Project Structure
```
.
├── backend/              # Spring Boot API
│   ├── src/main/java/com/ltech/
│   └── pom.xml
├── frontend/             # Next.js application
│   ├── app/             # App router pages
│   ├── components/      # Reusable React components
│   ├── lib/             # Utilities & helpers
│   └── package.json
├── CLAUDE.md            # This file
└── AGENTS.md            # Next.js agent rules
```

## Setup Instructions

### Backend
1. Ensure PostgreSQL is running: `docker run --name postgres-aluguel -e POSTGRES_PASSWORD=lucas123 -p 5432:5432 postgres`
2. Database configuration is in `backend/src/main/resources/application.properties`
3. Run: `cd backend && mvn spring-boot:run`
4. API runs on: http://localhost:8080

### Frontend
1. `cd frontend && npm install`
2. `npm run dev`
3. App runs on: http://localhost:3000

## Database Configuration
The backend is configured to:
- Auto-create/drop schema on startup (`spring.jpa.hibernate.ddl-auto=create-drop`)
- Display SQL statements in logs
- Use PostgreSQL dialect for Hibernate

## Important Notes
- Next.js version may have breaking changes - refer to `node_modules/next/dist/docs/` before making changes
- Java version requirement: 21+
- PostgreSQL must be accessible before starting the backend
