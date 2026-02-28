# Anota Gasto — Visão Geral do Projeto

## O que é

**Anota Gasto** é uma API REST para controle de gastos pessoais. A proposta é simples: o usuário se cadastra, faz login e passa a registrar suas despesas categorizadas, podendo marcar se é uma entrada (IN) ou saída (OUT) de dinheiro. A ideia é servir de backend para um app ou dashboard web de finanças pessoais.

---

## O que já foi feito

### Autenticação
- Registro de usuário com nome, e-mail e senha (senha armazenada com bcrypt)
- Login com retorno de JWT (validade de 7 dias)
- Middleware `authenticate` que valida o token e injeta o `userId` em todas as rotas protegidas

### Expenses (CRUD completo)
- **Listagem** de despesas do usuário autenticado, ordenadas da mais recente para a mais antiga
- **Criação** com validação de categoria (12 opções), direção (IN/OUT, padrão OUT) e valor positivo
- **Atualização parcial** (PATCH) com os mesmos campos opcionais
- **Remoção** com resposta 204 e 404 automático se a despesa não pertencer ao usuário

### Infraestrutura
- Express 5 com middleware de timeout (300ms), CORS configurável e logging via Pino
- Drizzle ORM com PostgreSQL e migrations versionadas
- Tratamento centralizado de erros com respostas padronizadas
- Suíte de testes unitários com 89 testes passando (Vitest)
- Linting/formatação automática com Biome

---

## Sugestões de próximos passos

### Configuração e infraestrutura

- **Aumentar o timeout**: 300ms é muito curto para rotas que tocam banco em produção; recomendo 5–10s
- **Dockerfile + compose para produção**: separar o compose de dev (só banco) do de prod (app + banco + reverse proxy)
- **CI/CD**: adicionar step de migração (`db:migrate`) no pipeline antes do deploy
- **Variável `JWT_EXPIRES_IN`**: tornar a expiração do token configurável via env em vez de hardcoded `"7d"`
- **Health check endpoint**: `GET /health` ou `GET /api/health` retornando status do banco

### Segurança

- **Rate limiting**: adicionar `express-rate-limit` nas rotas de auth (`/register`, `/login`) para prevenir brute force
- **Helmet**: adicionar headers de segurança HTTP (`helmet`)
- **Refresh token**: o JWT atual não tem renovação — implementar refresh token (short-lived access token + long-lived refresh token) para não expor credenciais a cada sessão expirada
- **UUID na rota vs banco**: validar o formato UUID do parâmetro `:id` antes de bater no banco (evita queries desnecessárias)
- **Sanitização de strings**: limitar o campo `description` para evitar armazenamento de conteúdo malicioso (Zod já ajuda, mas vale revisar)
- **`updated_at` no banco**: atualmente o campo é atualizado manualmente no código; avaliar usar um trigger de banco para garantir consistência

### Funcionalidades

- **Filtros e busca na listagem**: filtrar por categoria, direção, período (data início/fim) e valor mínimo/máximo — essa é provavelmente a primeira necessidade real de quem for usar
- **Paginação**: a listagem atual retorna tudo sem limite, o que pode ser um problema com muitas despesas
- **Resumo financeiro**: `GET /expenses/summary` retornando total por categoria, total IN vs OUT e saldo no período
- **Relatório por período**: `GET /expenses/report?month=2026-02` com totais, média diária e comparativo com período anterior
- **Despesas recorrentes**: marcar uma despesa como recorrente (mensal, semanal) e ter geração automática ou template para reuso
- **Orçamento por categoria**: definir um teto de gasto por categoria e receber alertas quando ultrapassado
- **Perfil do usuário**: rotas para atualizar nome, e-mail e senha (`PUT /profile`)
- **Exclusão de conta**: `DELETE /profile` com exclusão em cascata das despesas
- **Export**: exportar despesas em CSV ou PDF por período
- **Tags livres**: complementar as categorias fixas com tags personalizadas para granularidade maior
- **Anexos**: upload de comprovantes/recibos vinculados à despesa (S3 ou storage local)
