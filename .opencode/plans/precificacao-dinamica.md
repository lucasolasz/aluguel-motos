# Plano: Precificação Dinâmica com CRUD Admin

## Resumo

Precificação dinâmica (desconto progressivo, sazonalidade, tipo de km) gerenciada
via painel admin ao invés de `application.properties`. Configuração persistida no
banco como entidade singleton editável pelo admin.

## Decisões

- **Período multi-mês**: fator do mês da data de retirada
- **Carnaval**: faixa fixa aproximada (configurável pelo admin)
- **Km excedente econômica**: manter 100km/dia + R$0,50/km (cobrança manual)
- **Config**: CRUD admin em `/admin/precificacao` (não properties)
- **Frontend preview**: `lib/pricing.ts` espelha defaults; se admin mudar, frontend
  busca config via endpoint público `GET /api/precificacao`

## Fórmula

```
diariaEfetiva = precoBase × fatorDesconto(dias) × fatorSazonal(dataRetirada)
economica = diariaEfetiva
ilimitada = diariaEfetiva × 1.25
totalAluguel = diariaEfetiva × dias
```

---

## Arquivos NOVOS

### Backend (8 arquivos)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 1 | `domain/entities/TipoQuilometragem.java` | Enum: `ECONOMICA`, `ILIMITADA` |
| 2 | `domain/entities/ConfiguracaoPrecificacao.java` | Entidade singleton (1 row). 12 campos BigDecimal para sazonalidade mensal, 5 campos para Carnaval, `@OneToMany` descontoTiers |
| 3 | `domain/entities/DescontoTier.java` | Entidade filha: min, max, desconto, ordem. `@ManyToOne` → ConfiguracaoPrecificacao |
| 4 | `domain/repositories/ConfiguracaoPrecificacaoRepository.java` | Spring Data JPA repo |
| 5 | `domain/dtos/ConfiguracaoPrecificacaoDTO.java` | Response DTO (record com `static from()`) |
| 6 | `domain/dtos/ConfiguracaoPrecificacaoRequestDTO.java` | Request DTO (record) |
| 7 | `services/ConfiguracaoPrecificacaoService.java` | `obter()`, `salvar()`, `obterOuCriarDefault()` |
| 8 | `controllers/ConfiguracaoPrecificacaoController.java` | `GET /api/precificacao` (público), `GET /api/precificacao/admin` + `PUT /api/precificacao` (admin) |

### Frontend (2 arquivos)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 9 | `frontend/app/(admin)/admin/precificacao/page.tsx` | Página admin com 3 seções: tiers, sazonalidade, Carnaval |
| 10 | `frontend/services/precificacao.service.ts` | `getPrecificacao()`, `adminGetPrecificacao()`, `adminSavePrecificacao()` |

### SQL (1 arquivo)

| # | Arquivo | Descrição |
|---|---------|-----------|
| 11 | `backend/sql/V_add_precificacao.sql` | ALTER TABLEs para prod (ddl-auto=validate) |

---

## Arquivos MODIFICADOS

### Backend (5 arquivos)

| # | Arquivo | Mudança |
|---|---------|---------|
| 12 | `domain/entities/Reserva.java` | +3 campos: `tipoQuilometragem` (enum), `fatorDesconto`, `fatorSazonal` (BigDecimal) |
| 13 | `domain/dtos/CreateReservaDTO.java` | +1 campo: `String tipoQuilometragem` |
| 14 | `domain/dtos/ReservaDTO.java` | +3 campos no record + mapear em `from()` |
| 15 | `services/ReservaService.java` | Injetar `PrecificacaoService`; linha 95: usar `calcularDiariaEfetiva()` ao invés de `precoPorDia * dias`; setar snapshot dos fatores na Reserva |
| 16 | `services/PrecificacaoService.java` | Trocar `PrecificacaoConfig` por `ConfiguracaoPrecificacaoService` (lê do banco) |
| 17 | `security/SecurityConfig.java` | +regras: `GET /api/precificacao` público, `GET/PUT /api/precificacao/admin` → ADMIN_FULL |
| 18 | `resources/data.sql` | Seed default: 1 ConfiguracaoPrecificacao + 4 DescontoTiers |

### Frontend (6 arquivos)

| # | Arquivo | Mudança |
|---|---------|---------|
| 19 | `app/(admin)/admin/layout.tsx` | +link "Precificação" em `configNav` (ícone `SlidersHorizontal`) |
| 20 | `lib/pricing.ts` | Espelho client-side: `fatorDesconto()`, `fatorSazonal()`, `calcularDiariaEfetiva()` + defaults hardcoded + função para buscar config da API |
| 21 | `app/(public)/reservar/[step]/_components/etapa3/_components/kilometragem-selector.tsx` | Trocar `+R$20` por `*1.25`; receber `precoEfetivo` (já com desconto+sazonal) |
| 22 | `app/(public)/reservar/[step]/_components/price-summary.tsx` | Usar `calcularDiariaEfetiva()` de `lib/pricing.ts`; exibir detalhes (base, desconto%, sazonal, km) |
| 23 | `app/(public)/reservar/[step]/_components/booking-page-client.tsx` | Enviar `tipoQuilometragem` no payload; passar `precoEfetivo` para KilometragemSelector |
| 24 | `services/reservas.service.ts` | +campo `tipoQuilometragem` em `CreateReservaPayload` |
| 25 | `lib/types.ts` | +campos `tipoQuilometragem`, `fatorDesconto`, `fatorSazonal` em `Reservation`; novos tipos `PrecificacaoConfig`, `DescontoTierItem` |

---

## Detalhamento

### Entidade `ConfiguracaoPrecificacao`

```
@Entity @Table(name = "configuracao_precificacao")
id: UUID
--- Sazonalidade (12 campos) ---
janeiro, fevereiro, ..., dezembro: BigDecimal (default 1.0, exceto julho=0.75, dezembro=1.25)
--- Carnaval ---
carnavalInicioMes: int (default 2)
carnavalInicioDia: int (default 10)
carnavalFimMes: int (default 2)
carnavalFimDia: int (default 17)
carnavalFator: BigDecimal (default 1.40)
--- Tiers ---
descontoTiers: List<DescontoTier> (@OneToMany cascade ALL, orphanRemoval, @OrderBy ordem)
```

### Entidade `DescontoTier`

```
@Entity @Table(name = "desconto_tiers")
id: UUID
min: int
max: int
desconto: int (percentual: 0, 10, 20, 30)
ordem: int
configuracao: @ManyToOne ConfiguracaoPrecificacao
```

### Controller endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/precificacao` | público | Retorna config atual (para frontend calcular preview) |
| GET | `/api/precificacao/admin` | ADMIN_FULL | Retorna config atual (admin) |
| PUT | `/api/precificacao` | ADMIN_FULL | Salva config completa (substitui tiers) |

### Página admin (`/admin/precificacao`)

Layout com 3 seções em Cards:

1. **Desconto por Dias** — tabela editável com colunas: Min, Max, Desconto (%).
   Botões add/remove. Default 4 linhas.

2. **Sazonalidade Mensal** — grid 3×4 com 12 inputs numéricos (multiplicador).
   Labels: Jan, Fev, Mar, ..., Dez. Default: 1.0 (julho=0.75, dezembro=1.25).

3. **Carnaval** — 5 campos: mês início, dia início, mês fim, dia fim, fator.

Botão "Salvar Configuração" único no topo.

### PrecificacaoService (refatorado)

```java
@Service
@AllArgsConstructor
public class PrecificacaoService {
    private final ConfiguracaoPrecificacaoService configService;

    public BigDecimal calcularDiariaEfetiva(BigDecimal precoBase, int dias,
                                             LocalDate dataRetirada, TipoQuilometragem tipo) {
        ConfiguracaoPrecificacao config = configService.obter();
        BigDecimal diaria = precoBase
                .multiply(fatorDesconto(dias, config))
                .multiply(fatorSazonal(dataRetirada, config));
        if (tipo == TipoQuilometragem.ILIMITADA) {
            diaria = diaria.multiply(new BigDecimal("1.25"));
        }
        return diaria.setScale(2, RoundingMode.HALF_UP);
    }
    // fatorDesconto e fatorSazonal recebem config como parâmetro
}
```

### Seed data.sql

```sql
INSERT INTO configuracao_precificacao (id, janeiro, fevereiro, marco, abril, maio, junho,
  julho, agosto, setembro, outubro, novembro, dezembro,
  carnaval_inicio_mes, carnaval_inicio_dia, carnaval_fim_mes, carnaval_fim_dia, carnaval_fator)
VALUES ('40000000-0000-0000-0000-000000000001'::uuid,
  1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.75, 1.0, 1.0, 1.0, 1.0, 1.25,
  2, 10, 2, 17, 1.40);

INSERT INTO desconto_tiers (id, configuracao_id, min, max, desconto, ordem) VALUES
(gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 1, 2, 0, 0),
(gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 3, 4, 10, 1),
(gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 5, 7, 20, 2),
(gen_random_uuid(), '40000000-0000-0000-0000-000000000001'::uuid, 8, 999, 30, 3);
```

### SQL para produção

```sql
CREATE TABLE IF NOT EXISTS configuracao_precificacao (
  id UUID PRIMARY KEY,
  janeiro DECIMAL(5,4) DEFAULT 1.0, fevereiro DECIMAL(5,4) DEFAULT 1.0,
  marco DECIMAL(5,4) DEFAULT 1.0, abril DECIMAL(5,4) DEFAULT 1.0,
  maio DECIMAL(5,4) DEFAULT 1.0, junho DECIMAL(5,4) DEFAULT 1.0,
  julho DECIMAL(5,4) DEFAULT 1.0, agosto DECIMAL(5,4) DEFAULT 1.0,
  setembro DECIMAL(5,4) DEFAULT 1.0, outubro DECIMAL(5,4) DEFAULT 1.0,
  novembro DECIMAL(5,4) DEFAULT 1.0, dezembro DECIMAL(5,4) DEFAULT 1.0,
  carnaval_inicio_mes INT DEFAULT 2, carnaval_inicio_dia INT DEFAULT 10,
  carnaval_fim_mes INT DEFAULT 2, carnaval_fim_dia INT DEFAULT 17,
  carnaval_fator DECIMAL(5,4) DEFAULT 1.40
);

CREATE TABLE IF NOT EXISTS desconto_tiers (
  id UUID PRIMARY KEY,
  configuracao_id UUID REFERENCES configuracao_precificacao(id),
  min INT NOT NULL, max INT NOT NULL, desconto INT NOT NULL, ordem INT NOT NULL
);

ALTER TABLE reservas ADD COLUMN IF NOT EXISTS tipo_quilometragem VARCHAR(20) DEFAULT 'ECONOMICA';
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fator_desconto DECIMAL(5,4) DEFAULT 1.0;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS fator_sazonal DECIMAL(5,4) DEFAULT 1.0;
```

---

## Exemplos de Cálculo

| Cenário | Base | Dias | Data | KM | Desc | Saz | Diária | Total |
|---|---|---|---|---|---|---|---|---|
| Dez, 5d, ilimitada | 180 | 5 | 15/Dez | ILIMITADA | 0.80 | 1.25 | 225,00 | 1.125,00 |
| Jul, 2d, econômica | 180 | 2 | 10/Jul | ECONOMICA | 1.00 | 0.75 | 135,00 | 270,00 |
| Carnaval, 8d, econômica | 180 | 8 | 12/Fev | ECONOMICA | 0.70 | 1.40 | 176,40 | 1.411,20 |
| Jun, 3d, ilimitada | 180 | 3 | 20/Jun | ILIMITADA | 0.90 | 1.00 | 202,50 | 607,50 |

---

## Ordem de Execução

1. Backend: `TipoQuilometragem` enum
2. Backend: `ConfiguracaoPrecificacao` + `DescontoTier` entities
3. Backend: `ConfiguracaoPrecificacaoRepository`
4. Backend: DTOs (response + request)
5. Backend: `ConfiguracaoPrecificacaoService`
6. Backend: `PrecificacaoService` (criar novo, lê do banco)
7. Backend: `ConfiguracaoPrecificacaoController`
8. Backend: `SecurityConfig` (regras de acesso)
9. Backend: `Reserva` entity (+3 campos)
10. Backend: `CreateReservaDTO` (+tipoQuilometragem)
11. Backend: `ReservaDTO` (+3 campos)
12. Backend: `ReservaService` (usar PrecificacaoService)
13. Backend: `data.sql` (seed defaults)
14. Backend: SQL script para prod
15. Frontend: `lib/pricing.ts`
16. Frontend: `lib/types.ts` (novos tipos)
17. Frontend: `precificacao.service.ts`
18. Frontend: `reservas.service.ts` (+campo payload)
19. Frontend: `kilometragem-selector.tsx`
20. Frontend: `price-summary.tsx`
21. Frontend: `booking-page-client.tsx`
22. Frontend: `admin/layout.tsx` (+link sidebar)
23. Frontend: `admin/precificacao/page.tsx`
24. Build verification
