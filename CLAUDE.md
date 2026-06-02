# Aluguel Motos

## Stack
- **Backend**: Spring Boot 3.5.14, Java 21, PostgreSQL — porta **8080**
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui — porta 3000
- **Auth**: JWT via `com.auth0:java-jwt:4.4.0`, cookie `auth-token` (max-age 24h)
- **Storage**: Garage (S3-compatible) via AWS SDK v2 — upload de imagens

## Setup
```bash
# PostgreSQL via Docker
docker run --name postgres-aluguel -e POSTGRES_PASSWORD=lucas123 -p 5432:5432 postgres

# Backend (porta 8080)
cd backend && mvn spring-boot:run

# Frontend (porta 3000)
cd frontend && npm install && npm run dev
```

DB recria do zero a cada restart (`create-drop` + `data.sql`).

### Profiles (Spring) — VALORES via `.env`, COMPORTAMENTO via profile
- `application.properties` — base: placeholders `${VAR:default}` (valores) + `spring.config.import=optional:file:.env[.properties]` + `spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}`. Segredos sem default: `DB_PASSWORD`, `JWT_SECRET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
- `application-dev.properties` — só comportamento: `ddl-auto=create-drop`, `show-sql=true`, `sql.init.mode=always`.
- `application-prod.properties` — só comportamento: `show-sql=false`, `sql.init.mode=never`, `ssl.trust-all=false`.
- **`.env`** (backend/, gitignored) — valores/segredos de dev. Copie de `backend/.env.example`. Em prod, o `.env` não existe e os `${VAR}` resolvem das variáveis de ambiente reais.
- **Bypass de cert TLS** = `S3_SSL_TRUST_ALL` no `.env` (padrão `false`). Só a máquina do tribunal (rede com MITM) liga `=true`; casa (macbook) e prod não têm a linha → validam cert normal. Não há mais profile de truststore no `pom.xml`.
- Trocar dev↔prod: `SPRING_PROFILES_ACTIVE=prod` + definir as env vars.
- ⚠️ Prod com `update`+`never` não roda `data.sql` — primeiro deploy precisa de seed inicial (admin/grupos) por outro meio (futuro: Flyway).

### Build (esta máquina)
Defaults da máquina apontam p/ JDK antigo. Use: `JAVA_HOME=C:\Desenvolvimento Lucas\Java\jdk-21.0.5`, o wrapper `.\mvnw.cmd` (mvn do sistema é velho), e limpe `MAVEN_OPTS` antes (tem `MaxPermSize` inválido).

## Auth Flow
1. `POST /auth/login` (username = e-mail) → `{ token }` → `setToken(token)` cookie `auth-token`
2. `proxy.ts` protege **apenas** `/conta/**` → redireciona p/ `/login?redirect=<path>`. Rotas `/admin/**` não passam pelo proxy — dependem do token + checagem de role no backend.
3. Client components: `apiFetch()` de `lib/auth.ts` (Bearer token, trata 401 → logout)
4. Server components públicos: `services/*.service.ts` via `services/api.ts` (sem auth)

## Data Flow
- Base URL única: `lib/config.ts` → `API_URL = NEXT_PUBLIC_API_URL ?? http://localhost:8080`
- Prefixos `/api/...` e `/auth/...` ficam no path de cada chamada (não na base)
- `services/api.ts apiFetch()` — sem auth (público). `lib/auth.ts apiFetch()` — com Bearer

## .env.local (frontend)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Usuários seed (dev — data.sql)
- `lucas@admin.com` / `lucas123` — grupo DESENVOLVEDORES
- `danilo@admin.com` / `admin123` — grupo ADMINS

## Grupos e Permissões
Permissões: `ADMIN_FULL`, `RESERVAS_LEITURA`, `RESERVAS_ESCRITA`, `USUARIOS_LEITURA`, `LOCAIS_LEITURA`, `LOCAIS_ESCRITA`
- **DESENVOLVEDORES** — todas as permissões
- **ADMINS** — ADMIN_FULL, RESERVAS_*, USUARIOS_LEITURA, LOCAIS_*
- **GERAL** — RESERVAS_LEITURA, RESERVAS_ESCRITA (clientes)

## Storage / Upload (Garage S3)
- Backend: módulo desacoplado por interface (`StorageService` → `S3StorageService`). Detalhes em `backend/CLAUDE.md`.
- Endpoints admin (role ADMIN_FULL): `POST /api/uploads/motos`, `POST /api/uploads/vistorias`, `POST /api/uploads/contratos` (multipart `file` + id) → `{ key, url, contentType, size }`.
  - Paths no bucket: `motos/{motoId}/{uuid}.ext`, `reservas/{reservaId}/vistorias/{uuid}.ext`, `reservas/{reservaId}/contratos/{uuid}.ext`
- Garage: path-style, region `us-east-1`, endpoint `https://s3.ltech.app.br`. URL pública: `https://bucketaluguelmotos.ltech.app.br/<key>`.
- Para exibir imagem externa no `next/image`, adicionar o host em `images.remotePatterns` no `next.config.ts`.

## Projetos
- `backend/` — API Spring Boot → ver `backend/CLAUDE.md`
- `frontend/` — App Next.js → ver `frontend/CLAUDE.md`

## PagBank — Pagamentos e Tokenização de Cartão
- **Modo controlado por** `PAGBANK_ENABLED` no `.env`: `true` = PagBank real (sandbox ou prod), `false` = simulado (FakePaymentService).
- **Tokenização**: Frontend criptografa dados do cartão com chave pública RSA do PagBank (`jsencrypt`). Backend envia `encrypted` para `POST /tokens/cards` do PagBank. Retorna token `CARD_xxx`, bandeira, últimos dígitos. Backend NUNCA vê número do cartão.
- **Chave pública**: `GET /api/cartoes/public-key` → `{ mode: "pagbank"|"local", publicKey? }`. Frontend usa para decidir se criptografa ou envia plain.
- **Modo local** (`pagbank.enabled=false`): Frontend envia `{ nome, numero, validade, cpf }`. Backend mascara e armazena fingerprint SHA-256.
- **Modo PagBank** (`pagbank.enabled=true`): Frontend envia `{ nome, cpf, encrypted }`. Backend chama PagBank, salva `tokenPagBank` + `bandeira` + `numeroMascarado` do PagBank.
- **Cobrança**: Admin clica "Cobrar" → digita CVV → `POST /api/admin/reservas/{id}/cobrar` com `{ cvv }`. Backend usa `tokenPagBank` + CVV para criar charge no PagBank (`POST /orders`).
  - Aluguel: `capture: true` (cobrança imediata)
  - Caução: `capture: false` (pré-autorização/hold)
  - Liberação de caução: `POST /charges/{id}/cancel`
  - Captura de caução: `POST /charges/{id}/capture`
- **CVV nunca é armazenado** — entra na requisição e vai direto ao PagBank.
- **Entidades**: `Cartao` tem campos `tokenPagBank` e `bandeira` (nullable, usados só no modo PagBank). `Pagamento` tem `gatewayTransactionId` (id do charge no PagBank).
- **Services**: `PagBankService` (chamadas HTTP ao API PagBank), `PagBankPaymentService` (implementa `PaymentService` quando `pagbank.enabled=true`), `FakePaymentService` (simulado quando `pagbank.enabled=false`).
