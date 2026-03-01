# Roadmap — Anota Gasto

## Contexto e dor

O objetivo do app é resolver um problema simples: **anotar gastos rapidamente e depois entender onde o dinheiro foi**. Duas ações centrais:

1. **Registrar rápido** — o menor atrito possível no momento do gasto
2. **Conferir métricas** — visualizar totais, categorias, tendências e comparações

O MVP é uma API + um front SPA/PWA. A integração com WhatsApp é uma fase futura planejada.

---

## Fase 0 — Fundação

> Base técnica e funcionalidades core.

### 0.1 Autenticação de usuários ✅

```
POST /api/register  → cria conta (nome, celular, senha com bcrypt)
POST /api/auth      → retorna JWT com expiração de 1 dia
```

- Senhas com hash via `bcrypt`
- Token JWT assinado e verificado via Guardian
- Plug `AuthPipeline` protege todas as rotas privadas (extrai `user_id` do token e injeta em `conn.assigns.current_user`)

### 0.2 CRUD de despesas ✅ (parcial)

```
GET    /api/expenses         → lista todas as despesas do usuário autenticado
POST   /api/expenses         → cria uma despesa
PATCH  /api/expenses/:id     → atualiza campos de uma despesa
DELETE /api/expenses/:id     → remove uma despesa
```

Campos de uma despesa:

| Campo         | Tipo            | Descrição                       | Status |
| ------------- | --------------- | ------------------------------- | ------ |
| `description` | `varchar(255)`  | Descrição do gasto              | ✅     |
| `category`    | `enum`          | Ver categorias abaixo           | ✅     |
| `value`       | `numeric(10,2)` | Valor em reais                  | ✅     |

**Categorias disponíveis (`expense_category`):**

| Valor              | Descrição                                 |
| ------------------ | ----------------------------------------- |
| `:food`            | Compras em supermercado e feira           |
| `:eat_out`         | Refeições fora, delivery, lanche          |
| `:cleaning_products` | Itens de limpeza e higiene doméstica    |
| `:health`          | Consultas, plano de saúde, remédios       |
| `:housing`         | Aluguel, condomínio, luz, água, gás       |
| `:subscriptions`   | Streaming, SaaS, serviços recorrentes     |
| `:transport`       | Uber, ônibus, combustível, estacionamento |
| `:education`       | Cursos, livros, escola                    |
| `:shopping`        | Roupas, eletrônicos, compras em geral     |
| `:debts`           | Parcelas, empréstimos, cartão de crédito  |
| `:leisure`         | Cinema, viagens, hobbies                  |
| `:beauty`          | Salão, barbearia, cosméticos              |
| `:uncategorized`   | Fallback                                  |

> Ver **Fase 4** para a proposta de revisão dessas categorias.

### 0.3 Infraestrutura ✅ (parcial)

- ✅ Validação de input via Ecto Changesets
- ✅ Tratamento centralizado de erros via `FallbackController`
- ✅ Migrations versionadas com Ecto
- ⬜ CORS configurado
- ⬜ Timeout por requisição
- ⬜ Logging estruturado

---

## Fase 1 — MVP funcional

> Sem esses itens o app não faz sentido como produto.

### 1.1 Endpoint de detalhe de despesa ✅

```
GET /api/expenses/:id
```

Retorna uma despesa específica do usuário. Necessário para tela de edição no front.

---

### 1.2 Filtros e paginação na listagem

```
GET /api/expenses?month=2026-02&search=mercado&page=1&limit=20
```

Parâmetros planejados:

| Parâmetro   | Tipo          | Descrição                          |
| ----------- | ------------- | ---------------------------------- |
| `month`     | `YYYY-MM`     | Filtra pelo mês de `inserted_at`   |
| `search`    | `string`      | Busca parcial em `description`     |
| `page`      | `number`      | Página (default 1)                 |
| `limit`     | `number`      | Itens por página (default 20)      |
| `category`  | `string`      | Filtra por categoria               |

Sem paginação, a listagem vai crescer indefinidamente e travar o front.

---

### 1.3 Endpoint de resumo financeiro ✅

```
GET /api/analytics/summary?month=2026-02
```

O parâmetro `month` é opcional — sem ele, usa o mês atual.

Resposta:

```json
{
  "data": {
    "month": "2026-02",
    "total": "1250.00",
    "count": 23,
    "by_category": [
      { "category": "food",      "total": "450.00", "count": 8 },
      { "category": "transport", "total": "200.00", "count": 5 }
    ]
  }
}
```

`by_category` vem ordenado por `total` decrescente e inclui apenas categorias com ao menos uma despesa no mês. Como são no máximo 13 categorias, o payload nunca fica grande — serve direto para gráfico de pizza/donut e ranking de gastos no front.

---

### 1.4 Índices no banco ✅ (parcial)

Já criados na migration de expenses:

```
expenses (user_id)
expenses (user_id, inserted_at)
expenses (user_id, category)
```

Pendente:

```
users (phone_number)  ← já existe via unique_index
```

---

## Fase 2 — Analytics

> Transforma o app de "lista de gastos" em "ferramenta de controle financeiro".

### 2.1 Gastos por categoria ✅

Coberto pelo `GET /api/analytics/summary` — o campo `by_category` já entrega o agrupamento por categoria ordenado por total. Não há endpoint separado.

---

### 2.2 Evolução diária ✅

```
GET /api/analytics/daily?month=2026-02
```

O parâmetro `month` é opcional — sem ele, usa o mês atual. Retorna apenas os dias com ao menos uma despesa.

```json
{
  "data": {
    "month": "2026-02",
    "days": [
      { "date": "2026-02-01", "total": "85.00",  "count": 2 },
      { "date": "2026-02-03", "total": "230.00", "count": 1 }
    ]
  }
}
```

`count` indica quantas despesas foram lançadas naquele dia. O endpoint retorna só agregação — para ver as despesas de um dia específico, use `GET /api/expenses` com filtro de data. Alimenta o gráfico de linha na tela home.

---

### 2.3 Histórico mensal (últimos 12 meses)

```
GET /api/analytics/monthly
```

```json
[
  { "month": "2026-02", "total": "1250.00", "count": 23 },
  { "month": "2026-01", "total": "1150.00", "count": 18 }
]
```

Tela de relatórios — evolução ao longo do ano.

---

### 2.4 Comparação entre meses

```
GET /api/analytics/compare?month1=2026-02&month2=2026-01
```

```json
{
  "month1": { "month": "2026-02", "total": "1250.00", "by_category": [...] },
  "month2": { "month": "2026-01", "total": "1150.00", "by_category": [...] },
  "variation": "+8.69%"
}
```

---

### 2.5 Evolução por categoria

```
GET /api/analytics/category-evolution?months=6
```

```json
[
  {
    "category": "food",
    "months": [
      { "month": "2025-09", "total": "380.00" },
      { "month": "2025-10", "total": "420.00" }
    ]
  }
]
```

Mostra tendências por categoria ao longo do tempo.

---

## Fase 3 — Segurança e perfil (pré-produção)

### 3.1 Rate limiting

Aplicar nas rotas de auth via Plug:

- `POST /api/register` — 5 tentativas / 15 min por IP
- `POST /api/auth` — 10 tentativas / 15 min por IP

Previne brute force de senhas.

---

### 3.2 Headers de segurança

Configurar headers via Plug no endpoint:

- `X-Content-Type-Options`
- `X-Frame-Options`
- `Strict-Transport-Security`

---

### 3.3 Refresh token

O JWT atual expira em 1 dia sem renovação. Implementar:

- Access token de curta duração (1h)
- Refresh token de longa duração (30 dias) armazenado em cookie `httpOnly`
- `POST /api/auth/refresh` — renova o access token
- `POST /api/auth/logout` — invalida o refresh token

---

### 3.4 Perfil do usuário

```
GET   /api/users/me   → dados do usuário autenticado
PATCH /api/users/me   → atualizar nome, celular ou senha
```

Necessário também para preparar o campo `phone_number` antes da integração WhatsApp.

---

## Fase 4 — Refinamento de categorias

As categorias atuais foram simplificadas no início. Revisar para nomes mais claros e granulares:

| Atual          | Proposta                                     | Motivo                                    |
| -------------- | -------------------------------------------- | ----------------------------------------- |
| `:eat_out`     | `:eat_out` (sem mudança)                     | Já cobre delivery, lanche, café           |
| `:food`        | `:grocery` (`ALIMENTACAO_MERCADO`)           | Diferencia de outras compras              |
| `:transport`   | `:public_transport` + `:ride_apps`           | São gastos com perfis muito diferentes    |
| `:beauty`      | `:personal_expenses`                         | Mais abrangente                           |
| —              | `:medicine`                                  | Diferente de consultas/plano de saúde     |
| —              | `:uncategorized` (já existe)                 | Fallback obrigatório                      |

> **Atenção:** essa mudança exige migration de banco e atualização do enum no schema. Fazer antes de ter dados em produção para evitar migração de dados.

---

## Fase 5 — WhatsApp (pós-MVP)

### Fluxo

```
Usuário manda msg no WhatsApp
        │
        ▼
POST /api/whatsapp/webhook  (Meta Cloud API)
        │
        ├── valida assinatura X-Hub-Signature-256
        ├── identifica usuário pelo phone_number
        ├── faz parse do comando
        ├── executa ação (criar expense, retornar resumo, etc.)
        └── responde via Meta Messages API
```

### Comandos planejados

| Mensagem                           | Ação                                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| `gastei 50 almoço`                 | Cria expense: valor=50, desc="almoço", categoria inferida             |
| `gastei 35.90 mercado pão e leite` | Cria expense: valor=35.90, desc="pão e leite", cat=`:grocery`         |
| `total` / `resumo`                 | Retorna total do mês atual                                            |
| `total janeiro`                    | Retorna total de janeiro                                              |
| `ultimos` / `lista`                | Lista últimas 5 despesas                                              |
| `ajuda`                            | Lista comandos disponíveis                                            |

### Inferência de categoria

Fase 1 — mapeamento por palavras-chave:

```
almoço, jantar, restaurante, delivery, lanche → :eat_out
mercado, supermercado, feira                  → :grocery
uber, 99, taxi                                → :ride_apps
ônibus, metrô, trem                           → :public_transport
farmácia, remédio                             → :medicine
aluguel, condomínio, luz, água, gás           → :housing
netflix, spotify, assinatura                  → :subscriptions
```

Fase 2 — substituir por **Claude API** para linguagem natural real.

### Preparação necessária agora

- `phone_number` já existe na tabela `users`

### Pré-requisitos externos

- Conta Meta Business / WhatsApp Business API
- Número de telefone verificado na Meta
- URL pública para o webhook (ngrok no dev, domínio real em prod)
- Variáveis de ambiente: `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`

---

## Fase 6 — Funcionalidades extras

| Feature                                | Descrição                                                             |
| -------------------------------------- | --------------------------------------------------------------------- |
| **Input por linguagem natural (chat)** | Text area no app com a mesma sintaxe do WhatsApp — ver detalhe abaixo |
| Orçamentos por categoria               | Definir teto mensal por categoria; alerta quando ultrapassar          |
| Despesas recorrentes                   | Marcar expense como recorrente (mensal, semanal) com status `pending` → `paid` |
| Export CSV/PDF                         | Exportar despesas de um período                                       |
| Upload de comprovante                  | Foto/PDF do recibo vinculado à expense                                |
| Tags livres                            | Complementar as categorias com tags personalizadas                    |

### 6.1 Input por linguagem natural (chat)

Uma text area no front com UX similar ao WhatsApp: o usuário digita uma frase livre e a expense é criada sem preencher formulário.

**Exemplos de input:**

```
gastei 50 almoço
35.90 mercado pão e leite
recebi 200 freela
```

**Endpoint:**

```
POST /api/expenses/parse
{ "text": "gastei 50 almoço" }
```

Retorna a expense criada ou um erro descritivo se o input não for reconhecido.

**Reaproveitamento:** usa o mesmo parser e inferência de categoria da Fase 5. A única diferença é o canal de entrada (HTTP em vez de webhook).

---

## Decisão de front-end: SPA/PWA vs Flutter

### Recomendação: SPA/PWA para o MVP

Dado que a dor central é **anotar rápido** e **ver métricas**, o PWA resolve melhor no MVP:

| Critério                      | PWA                            | Flutter                         |
| ----------------------------- | ------------------------------ | ------------------------------- |
| Velocidade de desenvolvimento | Mais rápido                    | Mais lento (nova linguagem/SDK) |
| Fricção de instalação         | Zero (abre no browser)         | Requer download do app          |
| Dashboard/gráficos            | Excelente (Recharts, Chart.js) | Bom (fl_chart)                  |
| Experiência mobile            | Boa o suficiente               | Melhor (nativo)                 |
| Push notifications            | Sim (Web Push API)             | Sim                             |
| Câmera (foto de comprovante)  | Limitado                       | Excelente                       |
| Modo offline                  | Sim (Service Worker)           | Sim                             |

**Sugestão de stack para o front:**

- **React + Vite** (mais simples, zero config) ou **Next.js** (se quiser SSR/SSG no futuro)
- **Tailwind CSS** para estilização rápida
- **Recharts** ou **Chart.js** para os gráficos do dashboard
- Deploy como PWA habilitando o manifesto e service worker

**Flutter como fase 2** — depois do MVP validado, se a experiência nativa (câmera para comprovantes, notificações ricas) se tornar prioridade.

---

## Fase 7 — Gastos em família (Households)

> Permite que um casal (ou grupo) compartilhe o controle financeiro, mantendo cada despesa vinculada a quem gastou.

### Motivação

Hoje cada usuário só enxerga as próprias despesas. Para uso em família, o ideal é que ambos possam lançar gastos e visualizar o total do lar, com possibilidade de filtrar por pessoa.

### Modelo de dados

**Nova tabela `households`**

| Campo        | Tipo           | Descrição                          |
| ------------ | -------------- | ---------------------------------- |
| `id`         | `uuid`         | PK                                 |
| `name`       | `varchar(255)` | Ex: "Família Silva"                |
| `invite_code`| `varchar(8)`   | Código único para convidar membros |
| `inserted_at`| `timestamp`    | —                                  |

**Nova tabela `household_members`** (join table)

| Campo          | Tipo        | Descrição           |
| -------------- | ----------- | ------------------- |
| `user_id`      | `uuid`      | FK → users          |
| `household_id` | `uuid`      | FK → households     |
| `role`         | `enum`      | `:owner` ou `:member` |
| `inserted_at`  | `timestamp` | —                   |

**Alteração em `expenses`**

Adicionar coluna `household_id uuid` (nullable inicialmente). O `user_id` já existente indica _quem_ fez o gasto; o `household_id` indica _de qual grupo_ é.

### Endpoints novos

```
POST   /api/households                → cria um household (usuário vira :owner)
POST   /api/households/join           → entra com invite_code (vira :member)
GET    /api/households/me             → dados do household do usuário autenticado
GET    /api/households/me/members     → lista membros com id e nome
DELETE /api/households/me/members/:id → remove membro (só :owner)
```

**Filtro de despesas por membro:**

```
GET /api/expenses?member_id=<user_id>
```

O parâmetro `member_id` é opcional. Sem ele, retorna todas as despesas do household.

### Fluxo de uso

```
1. Você cria o household → recebe um invite_code (ex: "ABC12345")
2. Sua esposa cria a conta dela
3. Ela entra no household usando o invite_code
4. Ambos passam a ver as despesas do grupo
5. Cada um lança as próprias despesas normalmente
6. Dá pra filtrar por pessoa: GET /expenses?member_id=<id-da-esposa>
```

### Impacto nas rotas existentes

Após a migração, `GET /expenses` deve retornar as despesas do **household** do usuário (não só as dele). Usuários sem household continuam vendo apenas as próprias despesas.

Os endpoints de analytics (Fase 2) também devem respeitar o household como escopo padrão.

### Migrations necessárias

1. `create table(:households)`
2. `create table(:household_members)`
3. `alter table(:expenses) add :household_id :binary_id`
4. Índices: `(household_id)`, `(household_id, user_id)`, `(household_id, inserted_at)`

---

## Ordem de execução sugerida

```
[~] Fase 0 — Fundação
    [x] Autenticação (register + login + JWT + plug)
    [x] CRUD de despesas
    [ ] CORS e timeout

[x] Fase 1 — MVP funcional
    [x] GET /expenses/:id
    [x] Índices no banco
    [x] GET /expenses com filtros e paginação
    [x] GET /analytics/summary

[ ] Fase 2 — Analytics
    [x] GET /analytics/by-category (coberto pelo summary)
    [x] GET /analytics/daily
    [ ] GET /analytics/monthly
    [ ] GET /analytics/compare
    [ ] GET /analytics/category-evolution

[ ] Fase 3 — Segurança e perfil
    [ ] Rate limiting
    [ ] Headers de segurança
    [ ] Refresh token
    [ ] GET/PATCH /users/me

[ ] Fase 4 — Refinamento de categorias
    [ ] Atualizar enum no schema
    [ ] Migration de banco

[ ] Fase 5 — WhatsApp
    [ ] GET/POST /whatsapp/webhook
    [ ] Parser de comandos
    [ ] Inferência de categoria por palavras-chave
    [ ] Integração Claude API (linguagem natural)

[ ] Fase 6 — Extras
    [ ] POST /expenses/parse (input por linguagem natural)
    [ ] Orçamentos por categoria
    [ ] Despesas recorrentes (com status: pending → paid)
    [ ] Export CSV/PDF
    [ ] Upload de comprovante
    [ ] Tags livres

[ ] Fase 7 — Households (gastos em família)
    [ ] Migrations: households, household_members, expenses.household_id
    [ ] Índices nas novas tabelas
    [ ] POST /households
    [ ] POST /households/join
    [ ] GET /households/me
    [ ] GET /households/me/members
    [ ] DELETE /households/me/members/:id
    [ ] Filtro member_id em GET /expenses
    [ ] Atualizar escopo de analytics para household
```
