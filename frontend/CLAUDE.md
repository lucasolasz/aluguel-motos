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
    login/page.tsx           # Login → JWT cookie
  (account)/conta/           # Protegidas (proxy.ts → /conta/**)
    layout.tsx               # _components/account-sidebar
    page.tsx                 # Dashboard
    reservas/page.tsx        # Minhas reservas (reservation-card, reservation-details-dialog)
    perfil/page.tsx
    documentos/page.tsx      # Form de dados da CNH (cnh.service)
    cartoes/page.tsx
    configuracoes/page.tsx
  (admin)/admin/             # Painel admin (layout.tsx)
    page.tsx                 # Dashboard
    motos/page.tsx           # CRUD motos
    categorias/page.tsx      # CRUD categorias
    acessorios/page.tsx      # CRUD acessórios
    seguros/page.tsx         # CRUD seguros
    lavagens/page.tsx        # CRUD lavagens
    clientes/page.tsx        # Lista clientes
    reservas/page.tsx        # Todas reservas + update status
proxy.ts                     # Protege /conta/** (matcher /conta/:path*) → /login?redirect=
services/
  api.ts                     # apiFetch base (sem auth) → lib/config.ts API_URL
  motos.service.ts  categorias.service.ts  seguros.service.ts  acessorios.service.ts
  lavagens.service.ts  locais.service.ts            # catálogo (público + admin)
  reservas.service.ts  usuario.service.ts
  cartao.service.ts  endereco.service.ts  cnh.service.ts   # client auth
  ibge.service.ts                                   # API IBGE (estados/cidades)
lib/
  config.ts                  # API_URL = NEXT_PUBLIC_API_URL ?? http://localhost:8090
  types.ts                   # Source of truth dos tipos TS
  mappers.ts                 # DTOs → types
  auth.ts                    # getToken/setToken/clearToken/authHeaders/apiFetch (Bearer + trata 401)
  data.ts  utils.ts          # formatCurrency, formatDate, etc
  estados.ts  constants.ts   # estados BR, MARCAS, TRANSMISSOES, ANOS
components/
  header.tsx  footer.tsx  moto-card.tsx  categoria-card.tsx  ui/ (shadcn)
```

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
```

## Auth (lib/auth.ts)
- Cookie `auth-token` (max-age 24h, SameSite=Lax)
- `apiFetch<T>()` — adiciona `Authorization: Bearer`; em 401 limpa token e redireciona p/ `/login?redirect=`
- Server components públicos usam `services/api.ts` (sem auth)
- `proxy.ts` só protege `/conta/**`; `/admin/**` depende de token + role no backend

## Upload de arquivos (Garage S3)
- Backend expõe (todos multipart, role ADMIN_FULL):
  - `POST /api/uploads/motos` (`file` + `motoId`) → `{ url, key, ... }`
  - `POST /api/uploads/vistorias` (`file` + `reservaId`) → `{ url, key, ... }`
  - `POST /api/uploads/contratos` (`file` + `reservaId`) → `{ url, key, ... }`
- Fluxo: upload retorna URL pública → salva no campo correspondente (foto de moto, URL de vistoria, URL de contrato)
- Paths no bucket: `motos/{motoId}/{uuid}.ext`, `reservas/{reservaId}/vistorias/{uuid}.ext`, `reservas/{reservaId}/contratos/{uuid}.ext`
- Extensões permitidas: `jpg, jpeg, png, webp, pdf`
- `next/image` com URL externa do Garage exige host `bucketaluguelmotos.ltech.app.br` em `images.remotePatterns` no `next.config.ts`

## Key Patterns
1. Prefer Server Components nas rotas públicas; evitar `use client` desnecessário
2. Client auth usa `apiFetch()` de `lib/auth.ts`
3. Suspense + `*-loader.tsx` para carregamento assíncrono
4. `masked-input.tsx` — inputs com máscara (CPF, cartão, etc)
5. `ibge.service.ts` — cidades por estado via API IBGE
6. Subcomponentes co-localizados em `_components/` por rota
