# Frontend — Next.js App Router

## Structure
```
app/
  (public)/              # Rotas públicas
    page.tsx             # Home
    motos/               # Listagem e detalhe
    reservar/[id]/       # Fluxo de reserva (5 etapas)
    login/page.tsx       # Login → JWT cookie
    categorias/          # Categorias
    como-funciona/       # FAQ
  (account)/conta/       # Protegidas (middleware.ts)
    reservas/page.tsx    # Minhas reservas
    perfil/page.tsx      # Meu perfil
    documentos/page.tsx  # KYC
    configuracoes/page.tsx
  (admin)/               # Painel admin
proxy.ts                 # Protege /conta/** → /login?redirect=
services/
  api.ts                 # fetch base (server-side)
  categorias.service.ts
  motos.service.ts
  reservas.service.ts    # Client auth
  usuario.service.ts     # Client auth
  documentos.service.ts  # Client auth
  cartao.service.ts      # Client auth
  endereco.service.ts    # Client auth
lib/
  types.ts               # Source of truth TS types
  mappers.ts             # DTOs → types
  auth.ts                # getToken/setToken/clearToken/apiFetch
  data.ts                # formatCurrency(), formatDate()
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

Moto { id, nome, slug, marca, modelo, ano, precoPorDia, caucao, motor, potencia, transmissao, capacidadeTanque, alturaAssento, peso, itens: string[], disponivel, fotos: MotoFoto[], categoria: Categoria }
```

## Auth (lib/auth.ts)
- `getToken()` / `setToken(token)` / `clearToken()` — cookie `auth-token`
- `apiFetch<T>()` — adiciona `Authorization: Bearer <token>`
- Client components autenticados usam `apiFetch()`
- Server components públicos usam `services/*.service.ts`

## Fluxo de Reserva (reservar/[id])
1. **Datas** — dataRetirada, dataDevolucao
2. **Seguro** — seleção de plano
3. **Acessórios** — itens adicionais
4. **Resumo** — revisão antes de pagar
5. **Dados + Pagamento** — cartão + endereço cobrança

## Key Patterns
1. Prefer Server Components (rotas públicas)
2. Avoid unnecessary `use client`
3. Client auth usa `apiFetch()` de `lib/auth.ts`
4. Suspense para carregamento assíncrono