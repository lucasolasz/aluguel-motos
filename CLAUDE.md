# Aluguel Motos

## Stack
- **Backend**: Spring Boot 3.5.14, Java 21, PostgreSQL (localhost:5432, db: aluguel-moto, user: postgres, pwd: lucas123)
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: JWT via `com.auth0:java-jwt:4.4.0`, cookie `auth-token` no frontend

## Setup
```bash
# Backend: PostgreSQL via Docker
docker run --name postgres-aluguel -e POSTGRES_PASSWORD=lucas123 -p 5432:5432 postgres
cd backend && mvn spring-boot:run  # localhost:8080

# Frontend
cd frontend && npm install && npm run dev  # localhost:3000
```

DB recria do zero a cada restart (`create-drop` + `data.sql`).

## Frontend Structure
```
app/
  (public)/              # Rotas públicas (sem auth)
    page.tsx             # Home
    motos/               # Listagem e detalhe de motos
    reservar/[id]/       # Fluxo de reserva (7 steps)
    login/page.tsx       # Login → salva JWT em cookie auth-token
  (account)/conta/       # Protegidas por middleware.ts
    reservas/page.tsx    # Minhas reservas (dados reais)
    perfil/page.tsx      # Meu perfil (dados reais)
    documentos/page.tsx  # Meus documentos KYC (dados reais)
    configuracoes/page.tsx # Notificações + senha (ainda mock)
  (admin)/               # Painel admin (auth protegido)
proxy.ts                 # Protege /conta/**, redireciona p/ /login?redirect=<path>
services/
  api.ts                 # Base fetch + API_URL (server-side)
  categorias.service.ts  # Server component: getCategorias()
  motos.service.ts       # Server component: getMotos()
  reservas.service.ts    # Client: getMinhasReservas(), cancelarReserva()
  usuario.service.ts     # Client: getMeuPerfil(), atualizarPerfil()
  documentos.service.ts  # Client: getMeusDocumentos(), salvarDocumento()
lib/
  types.ts               # Source of truth para todos os tipos TS
  mappers.ts             # DTOs → types (public entities)
  auth.ts                # getToken/setToken/clearToken/apiFetch (client-side)
  data.ts                # formatCurrency(), formatDate()
```

## Auth Flow
1. `POST /auth/login` → `{ token }` → `setToken(token)` salva em cookie `auth-token`
2. `proxy.ts` lê cookie; redireciona `/conta/**` → `/login?redirect=<path>` se ausente
3. Client components chamam `apiFetch()` de `lib/auth.ts` (adiciona `Authorization: Bearer <token>`)
4. Server components de rotas públicas chamam `services/*.service.ts` direto (sem auth)

## Data Flow
**Server Components (público)** → `services/api.ts` → `API_URL=http://localhost:8080/api`
**Client Components (autenticado)** → `lib/auth.ts apiFetch()` → `NEXT_PUBLIC_API_URL=http://localhost:8080` + Bearer token

`.env.local`:
```
API_URL=http://localhost:8080/api
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Backend — Entities

### Usuario
```java
id (String/UUID), username, password, enabled
nomeCompleto, email, telefone, cpf (unique), numeroCnh
fotoPerfil  // URL string — nunca binário
grupo (ManyToOne → Grupo)
createdAt
```

### Moto
```java
id (UUID), nome, slug, marca, modelo, ano
precoPorDia, caucao (BigDecimal)
motor, potencia, transmissao, capacidadeTanque, alturaAssento, peso
itens (String CSV → frontend mapeia para array)
disponivel, fotos (OneToMany MotoFoto), categoria (ManyToOne)
```

### Reserva
```java
id (UUID), usuario (ManyToOne), moto (ManyToOne), seguro (ManyToOne, nullable)
dataRetirada, dataDevolucao (LocalDate), totalDias
status (enum): PENDENTE | CONFIRMADA | EM_ANDAMENTO | CONCLUIDA | CANCELADA
precoPorDia, caucao, totalAluguel, totalSeguro, totalAcessorios, total (BigDecimal)
acessorios (OneToMany → ReservaAcessorioItem)
createdAt
```

### ReservaAcessorioItem
```java
id (UUID), reserva (ManyToOne), acessorio (ManyToOne)
quantidade (int), precoPorDia (BigDecimal — snapshot no momento da reserva)
```

### Documento (KYC)
```java
id (UUID), usuario (ManyToOne)
tipo (enum): CNH_FRENTE | CNH_VERSO | SELFIE_COM_DOCUMENTO
url (String — URL do arquivo hospedado)
status (enum): PENDENTE | VERIFICADO | RECUSADO
createdAt
```

## Backend — Endpoints

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login → `{ token }` |
| POST | `/auth/register/cliente` | Auto-registro (grupo GERAL). Campos: username, password, nomeCompleto, email, telefone, cpf, numeroCnh |
| POST | `/auth/register` | Admin only (ADMINS/DESENVOLVEDORES). Campos: username, password, enabled, grupoId |
| GET | `/api/motos/**` | Listagem e detalhe |
| GET | `/api/categorias/**` | Categorias |
| GET | `/api/acessorios/**` | Acessórios |
| GET | `/api/seguros/**` | Seguros |

### Autenticados (Bearer token)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/usuarios/me` | Perfil do usuário logado |
| PUT | `/api/usuarios/me` | Atualiza nomeCompleto, email, telefone, numeroCnh, fotoPerfil |
| GET | `/api/reservas/me` | Reservas do usuário logado |
| POST | `/api/reservas` | Criar reserva |
| PATCH | `/api/reservas/{id}/cancelar` | Cancelar (só PENDENTE ou CONFIRMADA) |
| GET | `/api/documentos/me` | Documentos do usuário |
| POST | `/api/documentos` | Salvar/atualizar documento (upsert por tipo) |
| DELETE | `/api/documentos/{id}` | Excluir documento |

## Frontend — Types (lib/types.ts)

```ts
UserProfile { id, username, nomeCompleto, email, telefone, cpf, numeroCnh, fotoPerfil, createdAt }

Reservation {
  id, status: 'PENDENTE'|'CONFIRMADA'|'EM_ANDAMENTO'|'CONCLUIDA'|'CANCELADA'
  dataRetirada, dataDevolucao (string ISO date), totalDias
  moto: { id, nome, imagens: string[] }
  precoPorDia, caucao, totalAluguel, totalSeguro, totalAcessorios, total
  createdAt
}

Documento { id, tipo: DocumentoTipo, url, status: DocumentoStatus, createdAt }
```

## Grupos e Permissões (data.sql)
- **DESENVOLVEDORES** — todas as permissões
- **ADMINS** — ADMIN_FULL, RESERVAS_LEITURA, RESERVAS_ESCRITA, USUARIOS_LEITURA
- **GERAL** — RESERVAS_LEITURA, RESERVAS_ESCRITA (clientes auto-registrados)

## Key Patterns
1. `lib/types.ts` é source of truth para tipos TS
2. `fotoPerfil` e URLs de documentos são strings (nunca binário no banco)
3. Endpoint `/api/usuarios/me` usa `@AuthenticationPrincipal UsuarioDetails` para pegar usuário do JWT
4. `Reserva` calcula totais no `ReservaService` (não no frontend)
5. Documentos: upsert por tipo — cada usuário tem no máximo 1 doc de cada tipo

# Next.js Best Practices
- Prefer Server Components (rotas públicas)
- Use App Router
- Avoid unnecessary `use client`
- Client components com auth usam `apiFetch()` de `lib/auth.ts`
- Use Suspense para carregamento assíncrono
