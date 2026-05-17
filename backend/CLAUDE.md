# Backend — Spring Boot API

## Entities

### Usuario
```java
id (UUID), username, password, enabled
nomeCompleto, email, telefone, cpf (unique), numeroCnh
fotoPerfil (String URL — nunca binário)
grupo (ManyToOne → Grupo)
createdAt
```

### Moto
```java
id (UUID), nome, slug, marca, modelo, ano
precoPorDia, caucao (BigDecimal)
motor, potencia, transmissao, capacidadeTanque, alturaAssento, peso
itens (String CSV → frontend converte para array)
disponivel, fotos (OneToMany MotoFoto), categoria (ManyToOne)
```

### Categoria
```java
id (UUID), nome, slug, descricao, icone
```

### Acessorio
```java
id (UUID), nome, descricao, precoPorDia (BigDecimal), icone, disponivel
```

### Seguro
```java
id (UUID), nome, descricao, preco (BigDecimal)
coberturas (OneToMany → SeguroCobertura)
```

### SeguroCobertura
```java
id (UUID), seguro (ManyToOne), descricao
```

### Reserva
```java
id (UUID), usuario (ManyToOne), moto (ManyToOne), seguro (ManyToOne, nullable)
dataRetirada, dataDevolucao (LocalDate), totalDias
status: PENDENTE | CONFIRMADA | EM_ANDAMENTO | CONCLUIDA | CANCELADA
precoPorDia, caucao, totalAluguel, totalSeguro, totalAcessorios, total (BigDecimal)
acessorios (OneToMany → ReservaAcessorioItem)
cartaoNumeroMascarado (String, nullable)
createdAt
```

### ReservaAcessorioItem
```java
id (UUID), reserva (ManyToOne), acessorio (ManyToOne)
quantidade (int), precoPorDia (BigDecimal — snapshot no momento da reserva)
```

### Cnh
```java
id (UUID), usuario (OneToOne)
numero, categoria (String), dataExpiracao (LocalDate)
createdAt
```

### Documento (KYC)
```java
id (UUID), usuario (ManyToOne)
tipo: CNH_FRENTE | CNH_VERSO | SELFIE_COM_DOCUMENTO
url (String — URL do arquivo)
status: PENDENTE | VERIFICADO | RECUSADO
createdAt
```

### Cartao
```java
id (UUID), usuario (ManyToOne), enderecoCobranca (ManyToOne, nullable)
nome, numeroMascarado, validade, cpf
createdAt
```

### EnderecoCobranca
```java
id (UUID), usuario (ManyToOne)
cep, logradouro, numero, semNumero (boolean), complemento
estado, cidade, bairro
createdAt
```

## Endpoints

### Públicos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login → `{ token }` |
| POST | `/auth/register/cliente` | Auto-registro (grupo GERAL) |
| POST | `/auth/register` | Admin only |
| GET | `/api/motos/**` | Listagem e detalhe |
| GET | `/api/categorias/**` | Categorias |
| GET | `/api/acessorios/**` | Acessórios |
| GET | `/api/seguros/**` | Seguros |

### Autenticados (Bearer token)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/usuarios/me` | Perfil usuário logado |
| PUT | `/api/usuarios/me` | Atualiza perfil |
| GET | `/api/reservas/me` | Reservas do usuário |
| POST | `/api/reservas` | Criar reserva |
| PATCH | `/api/reservas/{id}/cancelar` | Cancelar (PENDENTE/CONFIRMADA) |
| GET | `/api/documentos/me` | Documentos KYC |
| POST | `/api/documentos` | Upsert por tipo |
| DELETE | `/api/documentos/{id}` | Excluir |
| GET | `/api/cartoes/me` | Cartões |
| POST | `/api/cartoes` | Criar cartão |
| PATCH | `/api/cartoes/{id}/endereco` | Associar endereço |
| GET | `/api/enderecos-cobranca/me` | Endereços |
| POST | `/api/enderecos-cobranca` | Criar endereço |
| GET | `/api/cnh/me` | CNH do usuário |
| POST | `/api/cnh` | Cadastrar/atualizar CNH |

### Admin (requer ADMIN_FULL)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/clientes` | Lista todos clientes |
| GET | `/api/admin/reservas` | Lista todas reservas |
| PATCH | `/api/admin/reservas/{id}/status` | Atualiza status reserva |

## Grupos e Permissões (data.sql)
- **DESENVOLVEDORES** — todas
- **ADMINS** — ADMIN_FULL, RESERVAS_*
- **GERAL** — RESERVAS_LEITURA, RESERVAS_ESCRITA (clientes)

## Key Patterns
1. `@AuthenticationPrincipal UsuarioDetails` para pegar usuário do JWT
2. Reserva calcula totais no `ReservaService` (não no frontend)
3. Documentos: upsert por tipo — 1 doc por tipo por usuário
4. Cartao ↔ Endereco: ManyToOne opcional
5. `CartaoFingerprintService` — deduplica cartões por fingerprint
6. `GlobalExceptionHandler` — trata exceções globalmente
