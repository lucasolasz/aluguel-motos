# Aluguel Motos

## Stack
- **Backend**: Spring Boot 3.5.14, Java 21, PostgreSQL (localhost:5432, DB: `aluguel-moto`)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: JWT via `com.auth0:java-jwt:4.4.0`, cookie `auth-token`

## Setup
```bash
# PostgreSQL via Docker
docker run --name postgres-aluguel -e POSTGRES_PASSWORD=lucas123 -p 5432:5432 postgres

# Backend (port 8080)
cd backend && mvn spring-boot:run

# Frontend (port 3000)
cd frontend && npm install && npm run dev
```

DB recria do zero a cada restart (`create-drop` + `data.sql`).

## Auth Flow
1. `POST /auth/login` → `{ token }` → `setToken(token)` cookie `auth-token`
2. `proxy.ts` protege `/conta/**` → redireciona p/ `/login?redirect=<path>`
3. Client components: `apiFetch()` de `lib/auth.ts` (Bearer token)
4. Server components públicos: `services/*.service.ts` direto (sem auth)

## Data Flow
- **Server Components**: `services/api.ts` → `API_URL=http://localhost:8080/api`
- **Client Components**: `lib/auth.ts apiFetch()` → `NEXT_PUBLIC_API_URL=http://localhost:8080`

## .env.local
```
API_URL=http://localhost:8080/api
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Grupos
- **DESENVOLVEDORES** — todas as permissões
- **ADMINS** — ADMIN_FULL, RESERVAS_*
- **GERAL** — clientes (RESERVAS_LEITURA, RESERVAS_ESCRITA)

## Projetos
- `backend/` — API Spring Boot (entities, endpoints, services) → ver `backend/CLAUDE.md`
- `frontend/` — App Next.js (components, pages, services, types) → ver `frontend/CLAUDE.md`