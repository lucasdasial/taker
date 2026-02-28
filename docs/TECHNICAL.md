# Anota Gasto — Documentação Técnica

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Linguagem | TypeScript 5 |
| Framework | Express 5 |
| ORM | Drizzle ORM 0.45 |
| Banco | PostgreSQL (driver `postgres`) |
| Validação | Zod 4 |
| Autenticação | JWT (`jsonwebtoken`) + bcryptjs |
| Logging | Pino + pino-pretty |
| Linting/Format | Biome |
| Testes | Vitest |
| Dev server | tsx watch |

---

## Estrutura de diretórios

```
src/
├── main.ts                        # Entrypoint — chama startServer()
├── config/
│   ├── envs.ts                    # Leitura e validação de variáveis de ambiente
│   └── jwt.ts                     # signToken / verifyToken
├── db/
│   ├── index.ts                   # Instância Drizzle (singleton)
│   ├── migrations/                # SQL gerado pelo drizzle-kit
│   └── schema/
│       ├── users.ts               # Tabela users
│       └── expenses.ts            # Tabela expenses + enums
├── modules/
│   ├── users/
│   │   ├── users.repository.ts
│   │   └── users.service.ts
│   └── expenses/
│       ├── expenses.repository.ts
│       └── expenses.service.ts
└── web/
    ├── server.ts                  # Criação e configuração do Express app
    ├── routes.ts                  # Composição de dependências e registro de rotas
    ├── controllers/
    │   ├── auth.controller.ts
    │   └── expenses.controller.ts
    ├── middlewares/
    │   ├── authenticate.ts        # JWT → req.body.userId
    │   ├── errorHandler.ts        # Tratamento centralizado de erros
    │   ├── logger.ts              # Pino logger + middleware de request log
    │   └── timeout.ts             # Timeout de 300ms por request
    └── errors/
        ├── AppError.ts            # Classe base de erros HTTP
        ├── ValidationError.ts     # 422 — wraps ZodError
        └── ResourceNotFoundError.ts # 404
```

---

## Banco de dados

### Tabela `users`

| Coluna | Tipo | Restrição |
|--------|------|-----------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `name` | `varchar(255)` | NOT NULL |
| `email` | `varchar(255)` | NOT NULL, UNIQUE |
| `password` | `varchar(255)` | NOT NULL (bcrypt hash) |
| `created_at` | `timestamp` | NOT NULL, `now()` |
| `updated_at` | `timestamp` | NOT NULL, `now()` |

### Tabela `expenses`

| Coluna | Tipo | Restrição |
|--------|------|-----------|
| `id` | `uuid` | PK, `gen_random_uuid()` |
| `description` | `varchar(255)` | NOT NULL |
| `category` | `expense_category` (enum) | NOT NULL |
| `direction` | `expense_direction` (enum) | NOT NULL, default `OUT` |
| `value` | `numeric(10,2)` | NOT NULL |
| `user_id` | `uuid` | NOT NULL, FK → `users.id` |
| `created_at` | `timestamp` | NOT NULL, `now()` |
| `updated_at` | `timestamp` | NOT NULL, `now()` |

### Enums PostgreSQL

**`expense_category`**
```
MERCADO, RESTAURANTES, PRODUTOS_LIMPEZA, SAUDE, MORADIA,
ASSINATURAS, TRANSPORTE, EDUCACAO, COMPRAS, DIVIDAS, LAZER, BELEZA
```

**`expense_direction`**
```
IN, OUT
```

---

## Variáveis de ambiente

| Variável | Obrigatória | Default | Descrição |
|----------|------------|---------|-----------|
| `DB_URL` | ✅ | — | Connection string PostgreSQL |
| `JWT_SECRET` | ✅ | — | Segredo para assinar os tokens |
| `NODE_ENV` | — | `development` | Controla verbosidade de erros |
| `PORT` | — | `3000` | Porta do servidor HTTP |
| `CORS_ORIGIN` | — | `http://localhost:5173` | Origem permitida pelo CORS |

---

## Fluxo de request

```
HTTP Request
    │
    ▼
server.ts (Express app)
    ├── cors()
    ├── express.json()
    ├── loggerMiddleware      ← loga método + URL + status + duração
    └── timeout (300ms)
    │
    ▼
routes.ts → /api
    ├── publicRoutes()
    │   ├── POST /api/auth/register
    │   └── POST /api/auth/login
    │
    └── authenticatedRoutes()  ← authenticate middleware primeiro
        ├── GET    /api/expenses
        ├── POST   /api/expenses
        ├── PATCH  /api/expenses/:id
        └── DELETE /api/expenses/:id
    │
    ▼
Controller → valida com Zod → chama Service
    │
    ▼
Service → regras de negócio → chama Repository
    │
    ▼
Repository → Drizzle ORM → PostgreSQL
    │
    ▼
errorHandler (middleware de erro)
    ├── ValidationError  → 422 + { error, issues, timestamp }
    ├── AppError         → statusCode + { error, timestamp }
    └── Error genérico   → 500 + { error } (mensagem real só em dev)
```

---

## API Endpoints

### Auth (público)

#### `POST /api/auth/register`

**Body**
```json
{
  "name": "Lucas",
  "email": "lucas@email.com",
  "password": "minhasenha123"
}
```

**Resposta 201**
```json
{
  "id": "uuid",
  "name": "Lucas",
  "email": "lucas@email.com",
  "createdAt": "2026-02-28T...",
  "updatedAt": "2026-02-28T..."
}
```

**Erros possíveis**
- `409` — e-mail já cadastrado
- `422` — validação falhou (name < 2 chars, e-mail inválido, senha < 8 chars)

---

#### `POST /api/auth/login`

**Body**
```json
{
  "email": "lucas@email.com",
  "password": "minhasenha123"
}
```

**Resposta 200**
```json
{ "token": "eyJ..." }
```

**Erros possíveis**
- `401` — credenciais inválidas
- `422` — validação falhou

---

### Expenses (autenticado)

Todas as rotas abaixo requerem o header:
```
Authorization: Bearer <token>
```

---

#### `GET /api/expenses`

Lista todas as despesas do usuário autenticado, ordenadas da mais recente para a mais antiga.

**Resposta 200**
```json
[
  {
    "id": "uuid",
    "description": "Feira do mês",
    "category": "MERCADO",
    "direction": "OUT",
    "value": "250.00",
    "userId": "uuid",
    "createdAt": "2026-02-28T...",
    "updatedAt": "2026-02-28T..."
  }
]
```

---

#### `POST /api/expenses`

**Body**
```json
{
  "description": "Feira do mês",
  "category": "MERCADO",
  "direction": "OUT",
  "value": 250.00
}
```

> `direction` é opcional (default `"OUT"`).

**Resposta 201** — objeto da despesa criada

**Erros possíveis**
- `401` — token inválido ou ausente
- `422` — validação falhou (description vazia, category inválida, value ≤ 0)

---

#### `PATCH /api/expenses/:id`

Atualização parcial — envie apenas os campos que deseja alterar.

**Body** (todos opcionais)
```json
{
  "description": "Feira atualizada",
  "category": "MERCADO",
  "direction": "OUT",
  "value": 300.00
}
```

**Resposta 200** — objeto da despesa atualizada

**Erros possíveis**
- `401` — token inválido ou ausente
- `404` — despesa não encontrada ou não pertence ao usuário
- `422` — validação falhou

---

#### `DELETE /api/expenses/:id`

**Resposta 204** — sem corpo

**Erros possíveis**
- `401` — token inválido ou ausente
- `404` — despesa não encontrada ou não pertence ao usuário

---

## Autenticação

- Algoritmo: **HS256** (HMAC-SHA256)
- Expiração: **7 dias**
- Payload do token: `{ sub: userId, iat, exp }`
- O middleware `authenticate` extrai o token do header `Authorization: Bearer <token>`, verifica com `jwt.verify` e injeta `req.body.userId` para uso nos controllers

---

## Tratamento de erros

### Classes de erro

| Classe | Status | Uso |
|--------|--------|-----|
| `AppError` | qualquer | Base — lançada diretamente nos services |
| `ValidationError` | 422 | Wraps `ZodError`; inclui lista de `issues` |
| `ResourceNotFoundError` | 404 | Recurso não encontrado ou sem permissão |

### Formato de resposta de erro

```json
// AppError genérico
{ "error": "mensagem", "timestamp": "ISO string" }

// ValidationError
{
  "error": "Validation failed",
  "timestamp": "ISO string",
  "issues": [
    { "field": "email", "message": "E-mail inválido." }
  ]
}
```

Em produção (`NODE_ENV !== "development"`), erros 500 retornam `"Internal server error"` em vez da mensagem real.

---

## Camadas e responsabilidades

| Camada | Arquivo | Responsabilidade |
|--------|---------|-----------------|
| Controller | `*.controller.ts` | Valida input com Zod, chama service, formata resposta HTTP |
| Service | `*.service.ts` | Regras de negócio, lança `AppError` quando necessário |
| Repository | `*.repository.ts` | Somente queries Drizzle; sem lógica de negócio |
| Middleware | `middlewares/` | Cross-cutting: auth, log, timeout, erros |

---

## Testes

Todos os testes são **unitários** (sem banco real). Cada camada é testada isoladamente com mocks.

```
npm run test         # executa uma vez
npm run test:watch   # modo watch
```

### Cobertura atual (89 testes)

| Arquivo | Testes |
|---------|--------|
| `expenses.controller.test.ts` | 13 |
| `expenses.service.test.ts` | 6 |
| `expenses.repository.test.ts` | 9 |
| `users.service.test.ts` | 7 |
| `users.repository.test.ts` | 5 |
| `auth.controller.test.ts` | 9 |
| `server.test.ts` | 11 |
| Middlewares e erros | ~29 |

### Padrão de mock do repositório

```typescript
// Mock do banco para repositories
function makeMockDb(rows = []) {
  const selectChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue(rows),
    limit: vi.fn().mockResolvedValue(rows),
  };
  return {
    select: vi.fn(() => selectChain),
    insert: vi.fn(() => ({
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(rows),
    })),
    update: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      where: vi.fn(() => ({ returning: vi.fn().mockResolvedValue(rows) })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({ returning: vi.fn().mockResolvedValue(rows) })),
    })),
  };
}
```

---

## Setup de desenvolvimento

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Subir o banco
docker compose up -d

# 3. Instalar dependências
npm install

# 4. Aplicar migrations
npm run db:migrate

# 5. Iniciar o servidor com hot reload
npm run dev
```

### Comandos do banco

```bash
npm run db:generate   # gera nova migration a partir das mudanças no schema
npm run db:migrate    # aplica migrations pendentes
npm run db:studio     # abre o Drizzle Studio (GUI)
```

### Adicionar um novo módulo

1. Criar `src/db/schema/<nome>.ts` com a tabela Drizzle
2. Importar o schema em `src/db/index.ts` (spread no objeto `schema`)
3. Rodar `npm run db:generate` e `npm run db:migrate`
4. Criar `src/modules/<nome>/<nome>.repository.ts` e `<nome>.service.ts`
5. Criar `src/web/controllers/<nome>.controller.ts` (classe com arrow functions)
6. Registrar em `src/web/routes.ts` na função `authenticatedRoutes()` (ou `publicRoutes()`)
