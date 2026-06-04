# Frontend — Next.js App Router

## Structure
```
app/
  (public)/                  # Rotas públicas (Server Components)
    page.tsx                 # Home (_components: features, search-form)
    motos/                   # Listagem (_components: motos-list, motos-loader) e detalhe [id] (booking-widget)
    reservar/[step]/         # Fluxo de reserva (stepper dinâmico por step) — ver abaixo
    categorias/              # Listagem e detalhe [slug]
    como-funciona/           # FAQ (faq-accordion)
    cadastro/                # Cadastro de cliente (wizard 3 etapas) — ver abaixo
    login/page.tsx           # Login → JWT cookie
  (account)/conta/           # Protegidas (proxy.ts → /conta/**)
    layout.tsx               # _components/account-sidebar
    page.tsx                 # Dashboard
    reservas/page.tsx        # Minhas reservas (reservation-card, reservation-details-dialog)
    perfil/page.tsx          # Perfil do usuário (ddi/ddd/numero)
    documentos/page.tsx      # Form de dados da CNH (cnh.service) — label "CNH" na sidebar
    cartoes/page.tsx         # Cartões de crédito
    enderecos/page.tsx       # Endereço residencial
    configuracoes/page.tsx
  (admin)/admin/             # Painel admin (layout.tsx)
    page.tsx                 # Dashboard (4 cards: Motos, Reservas, Receita, Clientes)
    motos/page.tsx           # CRUD motos
    categorias/page.tsx      # CRUD categorias
    acessorios/page.tsx      # CRUD acessórios
    seguros/page.tsx         # CRUD seguros
    lavagens/page.tsx        # CRUD lavagens
    clientes/page.tsx        # Lista clientes (tabela com CPF mascarado)
    reservas/page.tsx        # Todas reservas + busca por CPF + update status
    reservas/[id]/page.tsx   # Atendimento presencial (workflow de retirada/devolução)
 proxy.ts                     # Protege /conta/** (matcher /conta/:path*) → /login?redirect=
services/
  api.ts                     # apiFetch base (sem auth) → lib/config.ts API_URL
  auth.service.ts            # registrarCompleto(), checkEmail(), checkCpf()
  motos.service.ts  categorias.service.ts  seguros.service.ts  acessorios.service.ts
  lavagens.service.ts  locais.service.ts   # catálogo (público + admin)
  reservas.service.ts  usuario.service.ts
  cartao.service.ts  endereco.service.ts  cnh.service.ts       # client auth
  endereco-cobranca.service.ts  # endereços de cobrança
  ibge.service.ts                                   # API IBGE (estados/cidades)
lib/
  config.ts                  # API_URL = NEXT_PUBLIC_API_URL ?? http://localhost:8080
  types.ts                   # Source of truth dos tipos TS
  validations.ts             # validarCpf, validarLuhn, validarCartaoCompleto, validarEnderecoCompleto, etc
  atendimento-types.ts       # Tipos do atendimento: TipoPagamento, StatusPagamento, Pagamento, CnhDetalhe, etc
  auth.ts                    # getToken/setToken/clearToken/authHeaders/apiFetch (Bearer + trata 401)
  data.ts  utils.ts          # formatCurrency, formatDate, etc
  estados.ts  constants.ts   # estados BR, MARCAS, TRANSMISSOES, ANOS
components/
  header.tsx  footer.tsx  moto-card.tsx  categoria-card.tsx  ui/ (shadcn)
  address-fields.tsx          # Componente reutilizável de endereço (ViaCEP + IBGE)
  cnh-fields.tsx              # Componente reutilizável de CNH (6 campos)
```

## Cadastro de Clientes (cadastro/)
Wizard de **3 etapas** com estado gerenciado em `page.tsx`:
1. **etapa1** Dados Pessoais (`step1-dados.tsx`): nome completo, CPF (validado), gênero, DDI+DDD+celular (com confirmação), e-mail (com confirmação, paste bloqueado), endereço via `AddressFields`, senha com `PasswordChecklist`. Valida unicidade de e-mail/CPF antes de prosseguir.
2. **etapa2** Confirmação (`step2-confirmacao.tsx`): revisão dos dados (nome, CPF, gênero, celular, e-mail).
3. **etapa3** Conclusão (`step3-conclusao.tsx`): CNH via `CnhFields`, cartão (nome, número, validade, CVV, CPF titular), endereço de cobrança via `AddressFields`. Envio atômico via `registrarCompleto()` → `POST /auth/register/complete`.

## Fluxo de Reserva (reservar/[step])
Rota dinâmica por **step** (não por id). Estado global em `booking-page-client.tsx`; navegação em `booking-stepper.tsx`.
1. **etapa1** Datas — dataRetirada, dataDevolucao, horários, locais
2. **etapa2** Seguro — seleção de plano (nullable)
3. **etapa3** Acessórios — quantidade, lavagem (lavagem-selector), kilometragem
4. **etapa4** Resumo — revisão de totais (price-summary)
5. **etapa5** Dados + Pagamento — cartão (novo/existente) + endereço cobrança + termos

## Types (lib/types.ts) — destaques
```ts
UserProfile { id, username (=e-mail), nomeCompleto, ddi, ddd, numero, cpf, fotoPerfil, createdAt }
Moto { ...specs, itens: string[], disponivel, destaque?, fotos: MotoFoto[], categoria }
MotoRequest { ...specs, itens: string (CSV), categoriaId, fotos: {url,ordem,principal}[] }
Categoria { id, nome, descricao, slug, imageUrl }
Seguro / SeguroAdmin / SeguroRequest   # admin tem valorOriginal/valorComDesconto/percentualDesconto/etc
Acessorio { id, nome, descricao, precoPorDia, quantidadeMaxima, ativo }
LavagemServico { id, nome, descricao, valor, tipoCobranca: 'VALOR_UNICO', ativo }
Local / LocalResumo { nome, cep, logradouro, numero, complemento, bairro, cidade, estado, ... }
Reservation { status, datas+horas, localRetirada/Devolucao, moto, seguro, acessorios[], lavagem,
              totais (incl totalLavagem), cartaoNumeroMascarado, createdAt }
Cnh { rg, dataNascimento, numeroRegistro, numeroCnh, dataValidade, estado, createdAt }
Cartao { nome, numeroMascarado, validade, cpf, enderecoCobranca, vinculadoAReservas, createdAt }
Endereco { cep, logradouro, numero, semNumero, complemento, estado, cidade, bairro, createdAt }
EnderecoCobranca { id, cep, logradouro, numero, semNumero, complemento, estado, cidade, bairro, createdAt }
```

## Types de Pagamento (lib/atendimento-types.ts)
```ts
TipoPagamento = 'ALUGUEL' | 'CAUCAO'
StatusPagamento = 'PENDENTE' | 'PAGO' | 'AUTORIZADO' | 'LIBERADO' | 'CAPTURADO' | 'ESTORNADO' | 'FALHOU'
Pagamento { id, tipo, status, valor, gatewayTransactionId, metodo, createdAt }
```

## Auth (lib/auth.ts)
- Cookie `auth-token` (max-age 24h, SameSite=Lax)
- `apiFetch<T>()` — adiciona `Authorization: Bearer`; em 401 limpa token e redireciona p/ `/login?redirect=`
- Server components públicos usam `services/api.ts` (sem auth)
- `proxy.ts` só protege `/conta/**`; `/admin/**` depende de token + role no backend

## Validações (lib/validations.ts)
Todas as validações são funções puras customizadas (sem zod):
- `validarCpf(cpf)` — algoritmo de dígitos verificadores do CPF
- `validarLuhn(numero)` — algoritmo de Luhn para cartões (13-19 dígitos)
- `validarValidadeCartao(validade)` — formato MM/YY, não vencido
- `validarNomeCartao(nome)` — apenas letras, min 5 chars, uppercase
- `validarNomeCompleto(nome)` — apenas letras, min 2 palavras
- `validarDdi(ddi)` / `validarDdd(ddd)` — 1-3 dígitos / 2 dígitos 11-99
- `validarCartaoCompleto(c)` — combina todas as validações de cartão
- `validarEnderecoCompleto(a)` — CEP, logradouro, numero (ou semNumero), estado, cidade, bairro
- `validarCnh()` em `cnh-fields.tsx` — registro 11 dígitos, espelho 10 dígitos, datas válidas

## Telefone
Telefone é sempre tratado como **3 campos separados**: `ddi`, `ddd`, `numero`. Exibição formatada: `[ddi, ddd, numero].filter(Boolean).join(' ')` ou `+DDIDDDNUMERO` (função `montarTelefone()` em `dados-form.ts`).

## Upload de arquivos (Garage S3)
- Backend expõe (todos multipart, role ADMIN_FULL):
  - `POST /api/uploads/motos` (`file` + `motoId`) → `{ url, key, ... }`
  - `POST /api/uploads/vistorias` (`file` + `reservaId`) → `{ url, key, ... }`
  - `POST /api/uploads/contratos` (`file` + `reservaId`) → `{ url, key, ... }`
- Fluxo: upload retorna URL pública → salva no campo correspondente (foto de moto, URL de vistoria, URL de contrato)
- Paths no bucket: `motos/{motoId}/{uuid}.ext`, `reservas/{reservaId}/vistorias/{uuid}.ext`, `reservas/{reservaId}/contratos/{uuid}.ext`
- Extensões permitidas: `jpg, jpeg, png, webp, pdf`
- `next/image` com URL externa do Garage exige host `bucketaluguelmotos.ltech.app.br` em `images.remotePatterns` no `next.config.ts`

## Admin
- Sidebar tem link "Documentos" (`/admin/documentos`) que **não tem página implementada** — link quebrado.
- **Atendimento** (`/admin/reservas/[id]`): workflow completo de retirada/devolução:
  - Retirada: validar CNH → vistoria saída → contrato → cobrar (aluguel + caução)
  - Devolução: vistoria retorno → comparação → acerto caução → concluir
- API calls de admin: `adminVerificarCnh`, `adminCobrar`, `adminConcluirRetirada`, `adminConcluirDevolucao`, `adminAcertarCaucao`, `adminRegistrarVistoria`, `adminSalvarContrato`

## Key Patterns
1. Prefer Server Components nas rotas públicas; evitar `use client` desnecessário
2. Client auth usa `apiFetch()` de `lib/auth.ts`
3. Suspense + `*-loader.tsx` para carregamento assíncrono
4. `masked-input.tsx` — inputs com máscara (CPF, cartão, CEP, telefone, etc)
5. `ibge.service.ts` — cidades por estado via API IBGE
6. Subcomponentes co-localizados em `_components/` por rota
7. `AddressFields` — componente de endereço reutilizável com ViaCEP (auto-preenchimento) e IBGE (estados/cidades dinâmicos)
8. `CnhFields` — componente de CNH reutilizável (6 campos, validação integrada)
9. Footer contém informações da empresa "Rio Ride Rental" com endereço físico (Estr. de Camorim, 628 - Jacarepaguá, RJ) e telefone (21) 99888-4703
