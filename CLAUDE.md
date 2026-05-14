# Aluguel Motos

## Stack
- **Backend**: Spring Boot 3.5.14, Java 21, PostgreSQL (localhost:5432, user: postgres, pwd: lucas123)
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui

## Setup
```bash
# Backend: ensure PostgreSQL running
docker run --name postgres-aluguel -e POSTGRES_PASSWORD=lucas123 -p 5432:5432 postgres
cd backend && mvn spring-boot:run  # localhost:8080

# Frontend
cd frontend && npm install && npm run dev  # localhost:3000
```

## Frontend Structure
```
app/
  (public)/page.tsx        # Home, browse
  (admin)/                 # Admin panel (auth protected)
  layout.tsx
services/
  api.ts                   # Base fetch + env var API_URL
  categorias.service.ts    # getCategorias() → Categoria[]
  motos.service.ts         # getMotos() → Moto[]
lib/
  types.ts                 # Categoria, Moto (source of truth)
  mappers.ts               # DTOs → types
```

## Data Flow
**Server Components** → `services/*.service.ts` → Backend (optimal SSR, no extra hop)
**Client Components** → `app/api/route.ts` → Backend (BFF layer, auth headers, URL hidden)

## Types

### Categoria
```ts
{
  id: string
  nome: string
  descricao: string
  slug: string
  imageUrl: string
}
```

### Moto
```ts
{
  id: string
  nome: string
  marca: string
  modelo: string
  ano: number
  imagemUrl: string
  precoPorDia: number
  caucao: number
  motor: string
  potencia: string
  transmissao: string
  capacidadeTanque: string
  alturaAssento: string
  peso: string
  itens: string[]              // Backend sends CSV, mapped to array
  disponivel: boolean
  categoria: Categoria         // Nested object
}
```

## Key Patterns
1. Services use `mappers.ts` to transform backend DTO → frontend types
2. Keep `lib/types.ts` as single source of truth
3. `.env.local`: `API_URL=http://localhost:8080/api` (not committed)
4. Create Route Handlers only when Client Components need data

# Next.js Best Practices

- Prefer Server Components
- Use App Router
- Avoid unnecessary use client
- Prefer async server data fetching
- Use Suspense
- Use streaming where possible
- Optimize caching
- Follow Vercel recommendations