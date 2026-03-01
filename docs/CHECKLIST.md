# Checklist — Anotagasto

## Fase 0 — Fundação

### 0.1 Autenticação
- [x] `POST /api/register` — criar conta (nome, celular, senha)
- [x] `POST /api/auth` — retorna JWT
- [x] Hash de senha com bcrypt
- [x] Token JWT assinado e verificado (Guardian)
- [x] Plug `authenticate` protege rotas privadas

### 0.2 CRUD de despesas
- [x] `GET /api/expenses` — lista despesas do usuário autenticado
- [x] `POST /api/expenses` — cria despesa
- [x] `PATCH /api/expenses/:id` — atualiza despesa
- [x] `DELETE /api/expenses/:id` — remove despesa

### 0.3 Infraestrutura
- [x] Tratamento centralizado de erros (FallbackController)
- [x] Migrations versionadas
- [ ] Validação de input em todos os endpoints (changeset errors não retornam detalhes ao cliente)
- [ ] Logging estruturado
- [ ] CORS configurado
- [ ] Timeout por requisição

---

## Fase 1 — MVP funcional

- [x] `GET /api/expenses/:id` — detalhe de uma despesa
- [x] Índices no banco (`user_id`, `user_id + inserted_at`, `user_id + category`)
- [x] Filtros na listagem (`month`, `search`, `category`)
- [x] Paginação na listagem (`page`, `limit`)
- [ ] `GET /api/dashboard/summary?month=YYYY-MM`

---

## Fase 2 — Analytics

- [ ] `GET /api/dashboard/by-category?month=YYYY-MM`
- [ ] `GET /api/dashboard/daily?month=YYYY-MM`
- [ ] `GET /api/reports/monthly` — histórico dos últimos 12 meses
- [ ] `GET /api/reports/compare?month1=...&month2=...`
- [ ] `GET /api/reports/category-evolution?months=6`

---

## Fase 3 — Segurança e perfil

- [ ] Rate limiting em `/register` (5 req / 15 min por IP)
- [ ] Rate limiting em `/auth` (10 req / 15 min por IP)
- [ ] Headers de segurança
- [ ] Refresh token (access curto + refresh em cookie `httpOnly`)
- [ ] `POST /api/auth/refresh`
- [ ] `POST /api/auth/logout`
- [ ] `GET /api/users/me`
- [ ] `PATCH /api/users/me`

---

## Fase 4 — Refinamento de categorias

- [ ] Atualizar enum no schema (`:grocery`, `:public_transport`, `:ride_apps`, `:personal_expenses`, `:medicine`)
- [ ] Migration de banco para novo enum

---

## Fase 5 — WhatsApp

- [ ] `POST /api/whatsapp/webhook` com validação de assinatura
- [ ] `GET /api/whatsapp/webhook` (verificação Meta)
- [ ] Parser de comandos de texto
- [ ] Inferência de categoria por palavras-chave
- [ ] Integração Claude API para linguagem natural

---

## Fase 6 — Extras

- [ ] `POST /api/expenses/parse` — input por linguagem natural
- [ ] Orçamentos por categoria
- [ ] Despesas recorrentes (com status: `pending` → `paid`)
- [ ] Export CSV/PDF
- [ ] Upload de comprovante
- [ ] Tags livres

---

## Fase 7 — Households

- [ ] Migration: tabela `households`
- [ ] Migration: tabela `household_members`
- [ ] Migration: coluna `household_id` em `expenses`
- [ ] `POST /api/households`
- [ ] `POST /api/households/join`
- [ ] `GET /api/households/me`
- [ ] `GET /api/households/me/members`
- [ ] `DELETE /api/households/me/members/:id`
- [ ] Filtro `member_id` em `GET /api/expenses`
- [ ] Analytics respeitando escopo do household
