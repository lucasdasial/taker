# Roadmap — Anota Gasto

## Contexto e dor

O objetivo do app é resolver um problema simples: **anotar gastos rapidamente e depois entender onde o dinheiro foi**. Duas ações centrais:

1. **Registrar rápido** — o menor atrito possível no momento do gasto
2. **Conferir métricas** — visualizar totais, categorias, tendências e comparações

O MVP é uma API Node + um front SPA/PWA. A integração com WhatsApp é uma fase futura planejada.

---

## Status atual da API

| Módulo | Status |
|--------|--------|
| Registro e login (JWT) | ✅ feito |
| Middleware de autenticação | ✅ feito |
| CRUD completo de expenses | ✅ feito |
| Validação de input (Zod) | ✅ feito |
| Tratamento centralizado de erros | ✅ feito |
| Logging estruturado (Pino) | ✅ feito |
| Testes unitários (89 testes) | ✅ feito |
| CORS configurado | ✅ feito |
| Migrations versionadas (Drizzle) | ✅ feito |

---

## Fase 1 — MVP funcional

> Sem esses itens o app não faz sentido como produto.

### 1.1 Endpoint de detalhe de despesa

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

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `month` | `YYYY-MM` | Filtra pelo mês de `created_at` |
| `search` | `string` | Busca parcial em `description` |
| `page` | `number` | Página (default 1) |
| `limit` | `number` | Itens por página (default 20) |
| `category` | `string` | Filtra por categoria |
| `direction` | `IN` \| `OUT` | Filtra por direção |

Sem paginação, a listagem vai crescer indefinidamente e travar o front.

---

### 1.3 Endpoint de resumo financeiro

```
GET /api/dashboard/summary?month=2026-02
```

Resposta esperada:
```json
{
  "month": "2026-02",
  "totalOut": "1250.00",
  "totalIn": "300.00",
  "balance": "-950.00",
  "previousMonth": {
    "totalOut": "1150.00",
    "variation": "+8.69%"
  },
  "expenseCount": 23
}
```

É o card principal da tela home — total do mês e variação vs mês anterior.

---

### 1.4 Índices no banco

Adicionar via migration:
```sql
CREATE INDEX ON expenses (user_id);
CREATE INDEX ON expenses (user_id, created_at DESC);
CREATE INDEX ON users (email);
```

Sem índices as queries degradam conforme os dados crescem. Fazer agora, antes de ter dados em produção.

---

## Fase 2 — Analytics

> Transforma o app de "lista de gastos" em "ferramenta de controle financeiro".

### 2.1 Gastos por categoria

```
GET /api/dashboard/by-category?month=2026-02
```

```json
[
  { "category": "ALIMENTACAO_MERCADO", "total": "450.00", "percentage": 36 },
  { "category": "MORADIA", "total": "300.00", "percentage": 24 }
]
```

Alimenta o gráfico de pizza na tela home.

---

### 2.2 Evolução diária

```
GET /api/dashboard/daily?month=2026-02
```

```json
[
  { "date": "2026-02-01", "total": "85.00" },
  { "date": "2026-02-02", "total": "0.00" },
  { "date": "2026-02-03", "total": "230.00" }
]
```

Alimenta o gráfico de linha na tela home.

---

### 2.3 Histórico mensal (últimos 12 meses)

```
GET /api/reports/monthly
```

```json
[
  { "month": "2026-02", "totalOut": "1250.00", "totalIn": "300.00" },
  { "month": "2026-01", "totalOut": "1150.00", "totalIn": "0.00" }
]
```

Tela de relatórios — evolução ao longo do ano.

---

### 2.4 Comparação entre meses

```
GET /api/reports/compare?month1=2026-02&month2=2026-01
```

```json
{
  "month1": { "month": "2026-02", "totalOut": "1250.00", "byCategory": [...] },
  "month2": { "month": "2026-01", "totalOut": "1150.00", "byCategory": [...] },
  "variation": "+8.69%"
}
```

---

### 2.5 Evolução por categoria

```
GET /api/reports/category-evolution?months=6
```

```json
[
  {
    "category": "ALIMENTACAO_MERCADO",
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

Instalar `express-rate-limit` e aplicar nas rotas de auth:
- `POST /api/auth/register` — 5 tentativas / 15 min por IP
- `POST /api/auth/login` — 10 tentativas / 15 min por IP

Previne brute force de senhas.

---

### 3.2 Headers de segurança (Helmet)

Instalar `helmet` e adicionar no `server.ts`. Configura automaticamente headers como `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.

---

### 3.3 Refresh token

O JWT atual expira em 7 dias sem renovação. Implementar:
- Access token de curta duração (15 min ou 1h)
- Refresh token de longa duração (30 dias) armazenado em cookie `httpOnly`
- `POST /api/auth/refresh` — renova o access token
- `POST /api/auth/logout` — invalida o refresh token

---

### 3.4 Perfil do usuário

```
GET  /api/users/me     → dados do usuário autenticado
PATCH /api/users/me    → atualizar nome, e-mail ou senha
```

Necessário também para preparar o campo `phone` antes da integração WhatsApp.

---

## Fase 4 — Refinamento de categorias

As categorias atuais foram simplificadas no início. Revisar para nomes mais claros e granulares:

| Atual | Proposta | Motivo |
|-------|----------|--------|
| `RESTAURANTES` | `COMER_FORA` | Cobre delivery, lanche, café — mais amplo |
| `MERCADO` | `ALIMENTACAO_MERCADO` | Diferencia de outras compras |
| `TRANSPORTE` | `TRANSPORTE_PUBLICO` + `TRANSPORTE_APPS` | São gastos com perfis muito diferentes |
| `BELEZA` | `DESPESAS_PESSOAIS` | Mais abrangente |
| — | `REMEDIOS` | Diferente de consultas/plano de saúde |
| — | `SEM_CATEGORIA` | Fallback obrigatório |

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
        ├── identifica usuário pelo phone
        ├── faz parse do comando
        ├── executa ação (criar expense, retornar resumo, etc.)
        └── responde via Meta Messages API
```

### Comandos planejados

| Mensagem | Ação |
|----------|------|
| `gastei 50 almoço` | Cria expense: valor=50, desc="almoço", categoria inferida |
| `gastei 35.90 mercado pão e leite` | Cria expense: valor=35.90, desc="pão e leite", cat=ALIMENTACAO_MERCADO |
| `total` / `resumo` | Retorna total do mês atual |
| `total janeiro` | Retorna total de janeiro |
| `ultimos` / `lista` | Lista últimas 5 despesas |
| `ajuda` | Lista comandos disponíveis |

### Inferência de categoria

Fase 1 — mapeamento por palavras-chave:
```
almoço, jantar, restaurante, delivery, lanche → COMER_FORA
mercado, supermercado, feira                  → ALIMENTACAO_MERCADO
uber, 99, taxi                                → TRANSPORTE_APPS
ônibus, metrô, trem                           → TRANSPORTE_PUBLICO
farmácia, remédio                             → REMEDIOS
aluguel, condomínio, luz, água, gás           → MORADIA
netflix, spotify, assinatura                  → ASSINATURAS
```

Fase 2 — substituir por **Claude API** para linguagem natural real (já previsto no plano original).

### Preparação necessária agora

- Adicionar campo `phone varchar(20)` na tabela `users` (migration simples)
- Deixar o campo opcional por enquanto

### Pré-requisitos externos

- Conta Meta Business / WhatsApp Business API
- Número de telefone verificado na Meta
- URL pública para o webhook (ngrok no dev, domínio real em prod)
- Variáveis de ambiente: `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`

---

## Fase 6 — Funcionalidades extras

| Feature | Descrição |
|---------|-----------|
| Orçamentos por categoria | Definir teto mensal por categoria; alerta quando ultrapassar |
| Despesas recorrentes | Marcar expense como recorrente (mensal, semanal) |
| Export CSV/PDF | Exportar despesas de um período |
| Upload de comprovante | Foto/PDF do recibo vinculado à expense |
| Tags livres | Complementar as categorias com tags personalizadas |

---

## Decisão de front-end: SPA/PWA vs Flutter

### Recomendação: SPA/PWA para o MVP

Dado que a dor central é **anotar rápido** e **ver métricas**, o PWA resolve melhor no MVP:

| Critério | PWA | Flutter |
|----------|-----|---------|
| Velocidade de desenvolvimento | Mais rápido | Mais lento (nova linguagem/SDK) |
| Fricção de instalação | Zero (abre no browser) | Requer download do app |
| Dashboard/gráficos | Excelente (Recharts, Chart.js) | Bom (fl_chart) |
| Experiência mobile | Boa o suficiente | Melhor (nativo) |
| Mesma stack do backend | Sim (TypeScript) | Não (Dart) |
| Push notifications | Sim (Web Push API) | Sim |
| Câmera (foto de comprovante) | Limitado | Excelente |
| Modo offline | Sim (Service Worker) | Sim |

**Sugestão de stack para o front:**
- **React + Vite** (mais simples, zero config) ou **Next.js** (se quiser SSR/SSG no futuro)
- **Tailwind CSS** para estilização rápida
- **Recharts** ou **Chart.js** para os gráficos do dashboard
- Deploy como PWA habilitando o manifesto e service worker

**Flutter como fase 2** — depois do MVP validado, se a experiência nativa (câmera para comprovantes, notificações ricas) se tornar prioridade.

---

## Ordem de execução sugerida

```
[ ] Fase 1 — MVP funcional
    [ ] GET /expenses/:id
    [ ] GET /expenses com filtros e paginação
    [ ] GET /dashboard/summary
    [ ] Índices no banco

[ ] Fase 2 — Analytics
    [ ] GET /dashboard/by-category
    [ ] GET /dashboard/daily
    [ ] GET /reports/monthly
    [ ] GET /reports/compare
    [ ] GET /reports/category-evolution

[ ] Fase 3 — Segurança e perfil
    [ ] Rate limiting (express-rate-limit)
    [ ] Helmet
    [ ] Refresh token
    [ ] GET/PATCH /users/me

[ ] Fase 4 — Refinamento de categorias
    [ ] Atualizar enum no schema
    [ ] Migration de banco

[ ] Fase 5 — WhatsApp
    [ ] Adicionar campo phone em users
    [ ] GET/POST /whatsapp/webhook
    [ ] Parser de comandos
    [ ] Inferência de categoria por palavras-chave
    [ ] Integração Claude API (linguagem natural)

[ ] Fase 6 — Extras
    [ ] Orçamentos por categoria
    [ ] Despesas recorrentes
    [ ] Export CSV/PDF
    [ ] Upload de comprovante
    [ ] Tags livres
```
