# Frontend — Next.js App Router

## Structure
```
app/
  (public)/              # Rotas públicas
    page.tsx             # Home
    motos/               # Listagem e detalhe ([id])
    reservar/[id]/       # Fluxo de reserva (5 etapas)
    login/page.tsx       # Login → JWT cookie
    categorias/          # Listagem e detalhe ([slug])
    como-funciona/       # FAQ
  (account)/conta/       # Protegidas (proxy.ts)
    page.tsx             # Dashboard conta
    reservas/page.tsx    # Minhas reservas
    perfil/page.tsx      # Meu perfil
    documentos/page.tsx  # KYC (CNH_FRENTE, CNH_VERSO, SELFIE)
    cartoes/page.tsx     # Cartões de crédito
    configuracoes/page.tsx
  (admin)/admin/         # Painel admin
    page.tsx             # Dashboard admin
    clientes/page.tsx    # Lista clientes
    motos/page.tsx       # Lista motos
    reservas/page.tsx    # Todas reservas + update status
proxy.ts                 # Protege /conta/** → /login?redirect=
services/
  api.ts                 # fetch base (server-side, API_URL)
  categorias.service.ts
  motos.service.ts
  seguros.service.ts     # Público
  acessorios.service.ts  # Público
  reservas.service.ts    # Client auth
  usuario.service.ts     # Client auth
  documentos.service.ts  # Client auth
  cartao.service.ts      # Client auth
  endereco.service.ts    # Client auth
  cnh.service.ts         # Client auth
  ibge.service.ts        # IBGE API (estados/cidades)
lib/
  types.ts               # Source of truth TS types
  mappers.ts             # DTOs → types
  auth.ts                # getToken/setToken/clearToken/apiFetch
  data.ts                # formatCurrency(), formatDate()
  estados.ts             # Lista de estados BR
components/
  header.tsx, footer.tsx
  moto-card.tsx, categoria-card.tsx
```

## Types (lib/types.ts)
```ts
UserProfile { id, username, nomeCompleto, email, telefone, cpf, numeroCnh, fotoPerfil, createdAt }

Reservation {
  id, status, dataRetirada, dataDevolucao, totalDias
  moto: { id, nome, imagens: string[] }
  precoPorDia, caucao, totalAluguel, totalSeguro, totalAcessorios, total
  cartaoNumeroMascarado: string | null, createdAt
}

Documento { id, tipo: DocumentoTipo, url, status: DocumentoStatus, createdAt }

Cartao { id, nome, numeroMascarado, validade, cpf, enderecoCobranca: EnderecoCobranca | null, createdAt }

EnderecoCobranca { id, cep, logradouro, numero, semNumero, complemento, estado, cidade, bairro, createdAt }

Moto { id, nome, slug, marca, modelo, ano, precoPorDia, caucao, motor, potencia, transmissao,
       capacidadeTanque, alturaAssento, peso, itens: string[], disponivel,
       fotos: MotoFoto[], categoria: Categoria }

Seguro { id, nome, descricao, preco, coberturas: SeguroCobertura[] }

Acessorio { id, nome, descricao, precoPorDia, icone, disponivel }

Cnh { id, numero, categoria, dataExpiracao, createdAt }
```

## Auth (lib/auth.ts)
- `getToken()` / `setToken(token)` / `clearToken()` — cookie `auth-token`
- `apiFetch<T>()` — adiciona `Authorization: Bearer <token>`
- Client components autenticados usam `apiFetch()`
- Server components públicos usam `services/*.service.ts`

## Fluxo de Reserva (reservar/[id])
1. **Datas** — dataRetirada, dataDevolucao
2. **Seguro** — seleção de plano (nullable)
3. **Acessórios** — itens adicionais com quantidade
4. **Resumo** — revisão de totais antes de pagar
5. **Dados + Pagamento** — cartão existente ou novo + endereço cobrança

Estado global do stepper em `booking-page-client.tsx`. Cada etapa em `etapa{N}/`.

## Key Patterns
1. Prefer Server Components (rotas públicas)
2. Avoid unnecessary `use client`
3. Client auth usa `apiFetch()` de `lib/auth.ts`
4. Suspense para carregamento assíncrono
5. `masked-input.tsx` — inputs com máscara (CPF, cartão, etc)
6. `ibge.service.ts` — busca cidades por estado via API IBGE
