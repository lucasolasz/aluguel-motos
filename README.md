# Aluguel Motos

Aplicação full-stack para aluguel de motos.

## Stack

- **Backend:** Spring Boot 3.5 (Java 21) + PostgreSQL
- **Frontend:** Next.js 16 (App Router) + Tailwind CSS + shadcn/ui

---

## Rodar localmente

**Pré-requisitos:** Java 21, Maven, Node.js 20+, Docker

```bash
# PostgreSQL
docker run --name postgres-aluguel -e POSTGRES_PASSWORD=lucas123 -p 5432:5432 -d postgres

# Backend (porta 8080)
cd backend && mvn spring-boot:run

# Frontend (porta 3000)
cd frontend && npm install && npm run dev
```

Acesse http://localhost:3000

O banco é recriado a cada restart (`create-drop` + `data.sql`).

> **Nota:** As chamadas ao backend usam o prefixo `/api` nos endpoints (ex: `/api/motos`). A URL base **não** inclui `/api` — ela é definida em `frontend/lib/config.ts` e propagada para todos os services.

---

## Deploy

### Frontend (Vercel)

1. Conecte o repositório à Vercel
2. Framework: Next.js (auto-detectado)
3. Root Directory: `frontend`
4. Configure a env var:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://rioriderentalapi.ltech.app.br` |

Essa é a **única** variável de ambiente necessária no frontend. Todos os endpoints incluem `/api` no caminho (ex: `/api/motos`, `/auth/login`).

### Backend (Docker)

O backend é deployado via `docker-compose.portainer.yml`. Env vars necessárias:

| Variável | Descrição |
|---|---|
| `DB_URL` | JDBC URL do PostgreSQL |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `JWT_SECRET` | Chave de assinatura JWT |
| `CORS_ORIGINS` | Origens permitidas, separadas por vírgula |
