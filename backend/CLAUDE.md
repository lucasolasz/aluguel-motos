# Backend — Spring Boot API

Porta **8080**. Pacote raiz `com.ltech.backend`. Lombok em todas as entities/DTOs.

## Estrutura
```
config/           StorageProperties, S3Config
controllers/      *Controller + GlobalExceptionHandler
domain/dtos/      records (request + response DTOs)
domain/entities/  @Entity + enums
domain/repositories/  Spring Data JPA
security/         SecurityConfig, SecurityFilter, TokenService, UsuarioDetails(+Service), handlers
services/         *Service
services/storage/ StorageService (interface), S3StorageService, StorageException
```

## Entities

### Usuario
```
id (String UUID), username (= e-mail), password, enabled
nomeCompleto, ddi, ddd, numero, cpf (unique), numeroCnh
fotoPerfil (String URL), createdAt, grupo (ManyToOne)
```
> NÃO tem campo `email` — o `username` É o e-mail.

### Grupo / Permissao
```
Grupo: id (Long), nome, permissoes (ManyToMany EAGER → Permissao)
Permissao: id (Long), nome
```

### Moto
```
id (UUID), nome, slug, marca, modelo, ano
precoPorDia, caucao (BigDecimal)
motor, potencia, transmissao, capacidadeTanque, alturaAssento, peso (String)
itens (String CSV → frontend converte p/ array)
disponivel, destaque (Boolean)
fotos (OneToMany MotoFoto, cascade ALL, orphanRemoval, @OrderBy ordem)
categoria (ManyToOne)
```

### MotoFoto
```
id (UUID), moto (ManyToOne), url, ordem (Integer), principal (Boolean)
```

### Categoria
```
id (UUID), nome, descricao, slug (unique), imageUrl
```

### Acessorio
```
id (UUID), nome, descricao, precoPorDia (BigDecimal), quantidadeMaxima (Integer), ativo (Boolean)
```

### Seguro
```
id (UUID), nome, slug (unique), descricao, precoPorDia (BigDecimal)
basico (Boolean), valorOriginal, valorComDesconto, valorTotalPacote (BigDecimal)
percentualDesconto, maxParcelasSemJuros (Integer), recomendado, ativo (Boolean)
coberturas (OneToMany SeguroCobertura, @OrderBy ordem)
```

### SeguroCobertura
```
id (UUID), nome, tipo (TipoCobertura: INCLUSO|PARCIAL|NAO_INCLUSO), ordem (Integer), seguro (ManyToOne)
```

### LavagemServico
```
id (UUID), nome, descricao, valor (BigDecimal)
tipoCobranca (TipoCobrancaLavagem: VALOR_UNICO), ativo (Boolean)
```

### Local
```
id (UUID), nome (unique), cep, logradouro, numero, complemento, bairro, cidade, estado
ativo (Boolean), createdAt
```

### Reserva
```
id (UUID), usuario, moto, seguro (nullable), cartao (nullable), lavagemServico (nullable) — todos ManyToOne
dataRetirada, dataDevolucao (LocalDate), horaRetirada, horaDevolucao (LocalTime)
localRetirada, localDevolucao (ManyToOne Local)
totalDias (int), status (StatusReserva: PENDENTE|CONFIRMADA|EM_ANDAMENTO|CONCLUIDA|CANCELADA)
precoPorDia, caucao, totalAluguel, totalSeguro, totalAcessorios, totalLavagem, total (BigDecimal)
acessorios (OneToMany ReservaAcessorioItem), createdAt
```

### ReservaAcessorioItem
```
id (UUID), reserva (ManyToOne, @JsonIgnore), acessorio (ManyToOne)
quantidade (int), precoPorDia (BigDecimal — snapshot)
```

### Cnh
```
id (UUID), usuario (ManyToOne)
rg, numeroRegistro, numeroCnh, estado (String)
dataNascimento, dataValidade (LocalDate), createdAt
```

### Cartao
```
id (UUID), usuario, enderecoCobranca (ManyToOne, nullable)
nome, numeroMascarado, validade, cpf
fingerprint (String, unique por usuario_id+fingerprint)
createdAt
```

### EnderecoCobranca
```
id (UUID), usuario (ManyToOne)
cep, logradouro, numero, semNumero (boolean), complemento, estado, cidade, bairro, createdAt
```

## Endpoints

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login → `{ token }` |
| POST | `/auth/register/cliente` | Auto-registro (grupo GERAL) |
| GET | `/api/motos` `/api/motos/{id}` `/api/motos/destaque` | Listagem/detalhe/destaques |
| GET | `/api/categorias` `/api/categorias/{id}` | Categorias |
| GET | `/api/acessorios` `/api/acessorios/{id}` | Acessórios |
| GET | `/api/seguros` `/api/seguros/{id}` `/api/seguros/slug/{slug}` | Seguros |
| GET | `/api/lavagens` | Serviços de lavagem |
| GET | `/api/locais` `/api/locais/{id}` | Locais retirada/devolução |

### Autenticados (Bearer token)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/PUT | `/api/usuarios/me` | Perfil do usuário logado |
| GET | `/api/reservas/me` | Reservas do usuário |
| POST | `/api/reservas` | Criar reserva |
| PATCH | `/api/reservas/{id}/cancelar` | Cancelar |
| GET | `/api/cartoes/me` | Cartões |
| POST | `/api/cartoes` | Criar cartão (`{ nome, cpf, numero, validade }`) |
| DELETE | `/api/cartoes/{id}` | Excluir cartão |
| PATCH | `/api/cartoes/{id}/endereco` | Associar endereço |
| GET/POST | `/api/enderecos-cobranca/me` `/api/enderecos-cobranca` | Endereços de cobrança |
| GET/POST | `/api/cnh/me` `/api/cnh` | CNH do usuário |

### Admin / ADMIN_FULL (regras em SecurityConfig)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST/PUT/DELETE | `/api/motos/**` | CRUD motos (+ `GET /api/motos/admin`) |
| POST/PUT/DELETE | `/api/categorias/**` | CRUD categorias (+ `GET /admin`, `/admin/{id}`) |
| POST/PUT/DELETE | `/api/acessorios/**` | CRUD acessórios (+ `GET /admin`) |
| POST/PUT/DELETE | `/api/seguros/**` | CRUD seguros (+ `GET /admin`) |
| POST/PUT/DELETE | `/api/lavagens/**` | CRUD lavagens (+ `GET /admin`) |
| POST | `/api/uploads/motos` | Upload de imagem de moto (multipart `file` + `motoId`) |
| POST | `/api/uploads/vistorias` | Upload de foto de vistoria (multipart `file` + `reservaId`) |
| POST | `/api/uploads/contratos` | Upload de contrato assinado (multipart `file` + `reservaId`) |
| DELETE | `/api/uploads?key=` | Remover objeto do storage |

### Admin reservas/clientes/locais (`/api/admin/**`, autenticado)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/reservas` | Todas as reservas ( filtro por `?cpf=`) |
| GET | `/api/admin/reservas/{id}` | Detalhe completo para atendimento presencial |
| PATCH | `/api/admin/reservas/{id}/status` | Atualiza status |
| PATCH | `/api/admin/reservas/{id}/cnh-verificada` | Marca CNH como verificada |
| POST | `/api/admin/reservas/{id}/cobrar` | Cobra aluguel + autoriza caução (body: `{ cvv }`) |
| POST | `/api/admin/reservas/{id}/vistorias` | Registra vistoria (saída/retorno) |
| POST | `/api/admin/reservas/{id}/contrato` | Salva contrato assinado |
| POST | `/api/admin/reservas/{id}/concluir-retirada` | Conclui retirada → EM_ANDAMENTO |
| POST | `/api/admin/reservas/{id}/concluir-devolucao` | Conclui devolução → CONCLUIDA |
| GET | `/api/admin/clientes` `/api/admin/clientes/{id}` | Clientes |
| GET/POST/PUT/DELETE | `/api/admin/locais` `/api/admin/locais/{id}` | CRUD locais |

> `POST /auth/register` requer role ADMINS ou DESENVOLVEDORES.

## Storage / Upload (Garage S3)
- **Interface** `services/storage/StorageService`: `upload(file, prefix)`, `upload(file, motoId)`, `upload(file, prefix, parentId)`, `delete(key)`, `publicUrl(key)`, `presignedGetUrl(key, expiry)`.
- **Impl** `S3StorageService`: valida extensão/content-type/tamanho, gera keys: `motos/{motoId}/{uuid}.ext`, `reservas/{reservaId}/vistorias/{uuid}.ext`, `reservas/{reservaId}/contratos/{uuid}.ext`, ou `{prefix}/{parentId}/{uuid}.ext`. `putObject`, monta URL pública, auto-cria bucket no startup.
- **Config** `config/S3Config` (beans `S3Client` + `S3Presigner`) + `config/StorageProperties` (`storage.s3.*`).
- **Garage**: `forcePathStyle(true)`, `region=us-east-1`, `endpointOverride`. Checksums em `WHEN_REQUIRED` (SDK ≥2.30 quebra no Garage por padrão).
- **Erros**: validação → `ResponseStatusException` (400/413); infra → `StorageException` (502). Ambos tratados no `GlobalExceptionHandler`.
- **Validação** desacoplada em `StorageFileValidator` (regra de negócio, reaproveitável): tamanho, extensão e content-type. Extensões permitidas: `jpg, jpeg, png, webp, pdf`. Tipos genéricos (`null`/`application/octet-stream`) → deriva da extensão.
- **Env/config**: valores via `.env` (gitignored, copie de `backend/.env.example`); profile só define comportamento. Segredos: `S3_ACCESS_KEY`/`S3_SECRET_KEY` (sem default — exigidos).
- **Bypass de cert TLS**: `S3_SSL_TRUST_ALL` no `.env` (padrão `false`). Liga `=true` só na máquina atrás de MITM corporativo (tribunal); casa/prod validam cert. Mecanismo único — não há mais profile `dev-corp-truststore` no `pom.xml`.

## Key Patterns
1. `@AuthenticationPrincipal UsuarioDetails` para pegar o usuário do JWT
2. Reserva calcula totais no `ReservaService` (não no frontend)
3. `CartaoFingerprintService` — deduplica cartões por fingerprint SHA-256 (unique usuario+fingerprint).
5. `GlobalExceptionHandler` — `ResponseStatusException`, `StorageException`, `MaxUploadSizeExceededException`, `MethodArgumentNotValidException`, `HttpMessageNotReadableException`
6. Controllers mapeiam entity→DTO com records em `domain/dtos`
7. CRUD admin de catálogo (motos/categorias/etc) tem `GET /admin` separado do público
8. **Pagamentos**: `FakePaymentService` implementa `PaymentService` (simula aprovação). Interface preparada para gateway real futuro.
9. **Cartão**: `POST /api/cartoes` aceita `{ nome, cpf, numero, validade }`. Backend mascara e armazena fingerprint SHA-256.
10. **CVV**: nao armazenado. Passado via `CobrarDTO { cvv }` em `POST /api/admin/reservas/{id}/cobrar`.
