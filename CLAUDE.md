# Aluguel Motos

## Stack
- **Backend**: Spring Boot 3.5.14, Java 21, PostgreSQL — porta **8080**
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui — porta 3000
- **Auth**: JWT via `com.auth0:java-jwt:4.4.0`, cookie `auth-token` (max-age 24h)
- **Storage**: Garage (S3-compatible) via AWS SDK v2 — upload de imagens
- **Payment**: Asaas (gateway real via RestClient)

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

## Fase de Desenvolvimento
Projeto em **fase de desenvolvimento ativo**. Decisões priorizam:
- **Single source of truth**: valores de negócio vêm do banco (`data.sql` em dev, migrations em prod) — não duplicar em entidades Java
- **Fail-fast**: se config obrigatória não existe no banco, lançar erro ao invés de criar defaults Java silenciosos
- **Pronto para produção**: manter profiles dev/prod funcionais, sem hardcode que exija redeploy para mudar regra de negócio
- **Migrations**: quando Flyway entrar, criar migrations em `db/migration/`. Até lá, `data.sql` é a fonte única de seed.

### Profiles (Spring) — VALORES via `.env`, COMPORTAMENTO via profile
- `application.properties` — base: placeholders `${VAR:default}` (valores) + `spring.config.import=optional:file:.env[.properties]` + `spring.profiles.active=${SPRING_PROFILES_ACTIVE:dev}`. Segredos sem default: `DB_PASSWORD`, `JWT_SECRET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `ASAAS_API_KEY`, `ENCRYPTION_KEY`, `CARD_ENCRYPTION_KEY`.
- `application-dev.properties` — só comportamento: `ddl-auto=create-drop`, `show-sql=true`, `sql.init.mode=always`.
- `application-prod.properties` — só comportamento: `ddl-auto=validate`, `show-sql=false`, `sql.init.mode=never`, `ssl.trust-all=false`, `security.hsts.enabled=true`.
- **`.env`** (backend/, gitignored) — valores/segredos de dev. Copie de `backend/.env.example`. Em prod, o `.env` não existe e os `${VAR}` resolvem das variáveis de ambiente reais.
- **Bypass de cert TLS** = `S3_SSL_TRUST_ALL` no `.env` (padrão `false`). Só a máquina do tribunal (rede com MITM) liga `=true`; casa (macbook) e prod não têm a linha → validam cert normal.
- Trocar dev↔prod: `SPRING_PROFILES_ACTIVE=prod` + definir as env vars.
- ⚠️ Prod com `validate`+`never` não roda `data.sql` — primeiro deploy precisa de seed inicial (admin/grupos) por outro meio (futuro: Flyway).

### Build (esta máquina)
Defaults da máquina apontam p/ JDK antigo. Use: `JAVA_HOME=C:\Desenvolvimento Lucas\Java\jdk-21.0.5`, o wrapper `.\mvnw.cmd` (mvn do sistema é velho), e limpe `MAVEN_OPTS` antes (tem `MaxPermSize` inválido).

## Auth Flow
1. `POST /auth/login` (username = e-mail) → `{ token }` → `setToken(token)` cookie `auth-token`
2. `POST /auth/register/complete` — cadastro completo de cliente (dados pessoais + endereço + CNH + cartão + endereço cobrança) em uma única transação atômica. Registra no Asaas também. Retorna `{ token }`.
3. `GET /auth/check-email?email=` e `GET /auth/check-cpf?cpf=` — validação de unicidade (público).
4. `proxy.ts` protege **apenas** `/conta/**` → redireciona p/ `/login?redirect=<path>`. Rotas `/admin/**` não passam pelo proxy — dependem do token + checagem de role no backend.
5. Client components: `apiFetch()` de `lib/auth.ts` (Bearer token, trata 401 → logout)
6. Server components públicos: `services/*.service.ts` via `services/api.ts` (sem auth)

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

## Cadastro de Clientes
- **Frontend**: Wizard de 3 etapas em `/cadastro`:
  1. **Dados Pessoais**: nome completo, CPF, gênero, DDI+DDD+celular (com confirmação), e-mail (com confirmação), endereço residencial, senha (com checklist de força). Valida CPF (algoritmo) e unicidade de e-mail/CPF via API.
  2. **Confirmação**: revisão dos dados antes de prosseguir.
  3. **Conclusão**: CNH (RG, data nascimento, registro, espelho, validade, estado), cartão (nome, número, validade, CVV, CPF titular), endereço de cobrança.
- **Backend**: `POST /auth/register/complete` (`RegisterService.registrarCompleto()`) executa tudo em uma transação `@Transactional`: cria Usuario, Endereco (residencial), Cnh, EnderecoCobranca, Cartao, associa cartão↔endereço cobrança, cria customer no Asaas e salva `ClienteAsass`.

## Telefone
Telefone agora é **3 campos separados** em todas as camadas: `ddi` (código país, ex: "55"), `ddd` (área, ex: "21"), `numero` (ex: "999999999"). Frontend monta como `+DDIDDDNUMERO` quando precisa exibir formatado.

## Encriptação
- **CPF** (Usuario e Cartao): `AesEncryptor` (JPA `AttributeConverter`) — AES/GCM/NoPadding com IV determinístico (HMAC-SHA256 do plaintext). Garante que mesmo CPF sempre gera mesmo ciphertext → permite `@Column(unique = true)`. Chave: `ENCRYPTION_KEY`.
- **Número do cartão**: `CartaoNumeroEncryptor` — mesmo algoritmo, chave separada: `CARD_ENCRYPTION_KEY`. Campo `numeroEncriptado` no banco; `numeroMascarado` (ex: `**** 1234`) para exibição.

## Pagamentos (Asaas)
- **Gateway**: Asaas (produção) via `AsaasPaymentService` (`@Service` ativo). Interface `PaymentService` com 4 métodos: `cobrarAluguel`, `autorizarCaucao`, `liberarCaucao`, `capturarCaucao`.
- **AsaasService**: Cliente RestClient que fala com a API Asaas (`asaas.base-url`, `asaas.api-key`). Métodos: `buscarOuCriarCliente()`, `criarCobrancaCartao()`, `criarCliente()`.
- **Cobrança**: Admin clica "Cobrar" → digita CVV → `POST /api/admin/reservas/{id}/cobrar` com `{ cvv }`.
  - Aluguel: cobrança imediata via cartão de crédito
  - Caução: pré-autorização/hold (atualmente simulado no Asaas — implementação real pendente)
- **ClienteAsaas**: entidade que mapeia `Usuario` ↔ `customerId` do Asaas. Criado automaticamente no cadastro.
- **Pagamento**: entidade `Pagamento` com `tipo` (ALUGUEL/CAUCAO), `status` (PENDENTE/PAGO/AUTORIZADO/LIBERADO/CAPTURADO/ESTORNADO/FALHOU), `gatewayTransactionId`, `metodo`, `netValue`, `billingType` (BOLETO/CREDIT_CARD/PIX), `invoiceUrl`, `transactionReceiptUrl`.
- **CVV nunca é armazenado** — entra na requisição e vai direto ao Asaas.
- **DTOs Asaas**: `AsaasCustomerRequest/Response/ListResponse`, `AsaasPaymentRequest/Response` em `domain/dtos/asaas/`.
- `FakePaymentService` ainda existe no código (sem `@Service`) como referência, mas não é injetado.
- PagBank/PagSeguro foi **completamente removido** do código.

## Entidades (visão geral)
- **Usuario**: id, username (=e-mail), password, enabled, nomeCompleto, ddi, ddd, numero, cpf (encriptado, unique), fotoPerfil, grupo (ManyToOne), endereco (OneToOne), clienteAsass (OneToOne)
- **Endereco** (residencial): OneToOne com Usuario. cep, logradouro, numero, semNumero, complemento, estado, cidade, bairro
- **EnderecoCobranca** (cobrança): ManyToOne com Usuario (múltiplos endereços). Mesmos campos.
- **Cnh**: ManyToOne com Usuario. rg, numeroRegistro, numeroCnh, estado, dataNascimento, dataValidade
- **Cartao**: ManyToOne com Usuario e EnderecoCobranca. nome, numeroEncriptado, numeroMascarado, validade, cpf (encriptado), fingerprint (SHA-256, unique usuario+fingerprint)
- **ClienteAsaas**: OneToOne com Usuario. customerId (ID do cliente no Asaas)
- **Pagamento**: ManyToOne com Reserva. tipo, status, valor, gatewayTransactionId, metodo, netValue, billingType, invoiceUrl, transactionReceiptUrl
- **Reserva, Moto, MotoFoto, Categoria, Acessorio, Seguro, SeguroCobertura, LavagemServico, Local**: sem alterações significativas
- ~~Documento~~: **removido**. CNH agora é entidade própria `Cnh`.

## Admin
- `GET /api/admin/clientes` — lista clientes (CPF mascarado `***.***.***-NN`)
- `GET /api/admin/clientes/{id}` — detalhe do cliente (CPF/CNH completos visíveis)
- Sidebar admin tem link "Documentos" (`/admin/documentos`) que **não tem página implementada** — link quebrado.

## Frontend — Cadastro
- **Validação**: toda custom (sem zod). Funções em `lib/validations.ts`: `validarCpf` (algoritmo), `validarLuhn` (cartão), `validarValidadeCartao`, `validarNomeCartao`, `validarNomeCompleto`, `validarDdi`, `validarDdd`, `validarCartaoCompleto`, `validarEnderecoCompleto`.
- **AddressFields**: componente reutilizável com auto-preenchimento por ViaCEP (CEP) e IBGE (estados/cidades). Usado no cadastro (2x: residencial + cobrança), `/conta/enderecos`, e fluxo de reserva.
- **PasswordChecklist**: checklist de força de senha (10+ chars, especial, maiúscula, minúscula, número).
- **CNH**: componente `CnhFields` reutilizável com 6 campos. Usado no cadastro step 3 e em `/conta/documentos`.
