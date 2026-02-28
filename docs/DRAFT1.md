# TODO — AnotaGasto

API REST para app mobile de controle de despesas pessoais.

## Telas do App (referência)

### Tela 1 — Home / Dashboard
- Card total do mês
- Card variação vs mês anterior (ex: +8%)
- Gráfico pizza: gastos por categoria
- Gráfico linha: evolução semanal/diária
- Lista: últimos 5 gastos

### Tela 2 — Lista de Despesas
- Filtro por mês
- Lista completa com paginação
- Barra de busca (por descrição)
- Botão "+" para adicionar

### Tela 3 — Adicionar Despesa
- Select categoria
- Campo descrição
- Campo valor
- Botão salvar

### Tela 4 — Relatórios (avançado)
- Gastos mensais
- Comparação entre meses
- Evolução por categoria

---

## Feito

- [x] Módulo de despesas (CRUD parcial — criação)
- [x] Módulo de usuários (criação com senha criptografada via BCrypt)
- [x] SecurityConfig com HTTP Basic (rota de criar usuário pública, demais autenticadas)
- [x] DTOs de request e response para ambos os módulos
- [x] Migrations Flyway (users, expenses com FK user_id)

---

## Autenticação & Autorização

- [ ] Migrar de HTTP Basic para JWT (login retorna token)
- [ ] Refresh token
- [ ] Logout (blacklist de tokens)
- [ ] Reset de senha via email

## Endpoints — Despesas (Telas 1, 2, 3)

- [ ] `POST /expenses` — vincular despesa ao usuário autenticado
- [ ] `GET /expenses` — listar despesas do usuário (paginação, filtro por mês)
- [ ] `GET /expenses/{id}` — detalhe de uma despesa
- [ ] `GET /expenses/search?q=` — busca por descrição
- [ ] `PUT /expenses/{id}` — editar despesa
- [ ] `DELETE /expenses/{id}` — remover despesa

## Endpoints — Usuário

- [ ] `GET /users/me` — perfil do usuário autenticado
- [ ] `PUT /users/me` — atualizar perfil

## Endpoints — Dashboard (Tela 1)

- [ ] `GET /dashboard/summary` — total do mês + variação vs mês anterior
- [ ] `GET /dashboard/by-category?month=` — totais por categoria (gráfico pizza)
- [ ] `GET /dashboard/daily?month=` — evolução diária do mês (gráfico linha)
- [ ] `GET /expenses?limit=5&sort=createdAt,desc` — últimos 5 gastos

## Endpoints — Relatórios (Tela 4)

- [ ] `GET /reports/monthly` — totais mensais (últimos 12 meses)
- [ ] `GET /reports/compare?month1=&month2=` — comparação entre dois meses
- [ ] `GET /reports/category-evolution?months=6` — evolução por categoria ao longo dos meses

## Integração WhatsApp

O usuário se autentica pelo número de celular (já cadastrado no campo `phone`) e gerencia
despesas diretamente pelo chat do WhatsApp.

### Como funciona

```
Usuário                     AnotaGasto API                   WhatsApp Cloud API (Meta)
  |                            |                              |
  |-- manda msg no WhatsApp -->|                              |
  |                            |<-- webhook POST /whatsapp ---|
  |                            |    (valida signature)        |
  |                            |-- identifica user por phone  |
  |                            |-- processa comando           |
  |                            |-- POST messages API -------->|
  |<-------------------------------------------resposta-------|
```

### Autenticação

- Usuário manda qualquer mensagem → API busca user pelo `phone`
- Se não encontrar → responde "Número não cadastrado, crie sua conta no app"
- Se encontrar → está autenticado (o WhatsApp já garante a identidade do número)
- Sem necessidade de senha no fluxo WhatsApp

### Comandos do chat

| Mensagem do usuário | Ação |
|---|---|
| `gastei 50 almoço` | Cria despesa: valor=5000, desc="almoço", categoria=COMER_FORA (inferida) |
| `gastei 120 uber` | Cria despesa: valor=12000, desc="uber", categoria=TRANSPORTE_APPS |
| `gastei 35.90 mercado pão e leite` | Cria despesa: valor=3590, desc="pão e leite", categoria=ALIMENTACAO_MERCADO |
| `total` ou `resumo` | Retorna total do mês atual |
| `total janeiro` | Retorna total de janeiro |
| `ultimos` ou `lista` | Lista últimas 5 despesas |
| `apagar 42` | Remove despesa #42 |
| `categorias` | Lista categorias disponíveis |
| `ajuda` | Lista comandos disponíveis |

### Inferência de categoria

Mapeamento simples por palavras-chave na descrição:
- almoço, jantar, restaurante, lanche → `COMER_FORA`
- mercado, supermercado, feira → `ALIMENTACAO_MERCADO`
- uber, 99, taxi, ônibus, metrô → `TRANSPORTE_APPS` / `TRANSPORTE_PUBLICO`
- farmácia, remédio → `REMEDIOS`
- aluguel, condomínio, luz, água, gás → `MORADIA`
- netflix, spotify, assinatura → `ASSINATURAS`
- (sem match) → `SEM_CATEGORIA`

Futuro: substituir por LLM (Claude API) para inferência mais inteligente.

### Arquitetura no projeto

```
modules/whatsapp/
├── data/
│   └── WhatsappSessionModel.java      # (opcional) cache de estado da conversa
├── useCases/
│   ├── ReceiveMessageUseCase.java      # orquestra: parse → identifica user → executa → responde
│   ├── ParseCommandUseCase.java        # extrai intenção + dados da mensagem
│   ├── InferCategoryUseCase.java       # mapeia palavras-chave → CategoriesEnum
│   └── SendWhatsappMessageUseCase.java # chama Meta Cloud API para enviar resposta
└── web/
    ├── WhatsappWebhookController.java  # POST /whatsapp/webhook (recebe msgs)
    │                                   # GET  /whatsapp/webhook (verificação Meta)
    └── WhatsappWebhookDto.java         # payload do webhook da Meta
```

### Pré-requisitos

- [ ] Conta Meta Business / WhatsApp Business API
- [ ] Número de telefone verificado na Meta
- [ ] Configurar webhook URL pública (ngrok para dev, domínio real para prod)
- [ ] Variáveis de ambiente: `WHATSAPP_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`

### Tarefas de implementação

- [ ] `GET /whatsapp/webhook` — verificação do webhook (Meta envia challenge)
- [ ] `POST /whatsapp/webhook` — receber mensagens (validar signature `X-Hub-Signature-256`)
- [ ] `ParseCommandUseCase` — extrair intenção (gastei, total, ultimos, apagar, ajuda)
- [ ] `InferCategoryUseCase` — mapear palavras-chave → categoria
- [ ] `SendWhatsappMessageUseCase` — enviar resposta via Meta Cloud API
- [ ] `ReceiveMessageUseCase` — orquestrar o fluxo completo
- [ ] Liberar `/whatsapp/webhook` no SecurityConfig (`permitAll`)
- [ ] Testes unitários do parse de comandos e inferência de categoria

### Evolução futura

- [ ] Usar Claude API para interpretar mensagens em linguagem natural
- [ ] Suporte a mensagens de voz (speech-to-text → parse)
- [ ] Notificações proativas (lembrete de registrar gastos, alerta de orçamento)
- [ ] Mensagem de boas-vindas com template aprovado pela Meta

---

## Funcionalidades extras

- [ ] Orçamentos mensais por categoria (com alerta ao ultrapassar)
- [ ] Despesas recorrentes (assinatura, aluguel)
- [ ] Tags customizadas além das categorias
- [ ] Upload de comprovante (imagem/PDF)
- [ ] Exportar CSV/PDF

## Segurança (pré-produção)

- [ ] Rate limiting nos endpoints (especialmente `/users`)
- [ ] Configurar CORS corretamente (não `*`)
- [ ] Validar que usuário só acessa suas próprias despesas
- [ ] Garantir que senhas nunca apareçam em logs ou responses
- [ ] Headers de segurança (HSTS, X-Content-Type-Options)
- [ ] Variáveis sensíveis via env vars ou vault

## Qualidade de código

- [ ] Testes unitários nos use cases
- [ ] Testes de integração nos controllers
- [ ] Handler global de exceções (`@ControllerAdvice`)
- [ ] Logging estruturado (SLF4J + JSON em produção)

## Banco de dados

- [ ] Índices em `user_id` (expenses) e `email` (users)
- [ ] Tornar `user_id` em expenses `NOT NULL`
- [ ] Backup automatizado do PostgreSQL

## Infraestrutura

- [ ] Dockerfile + docker-compose para a aplicação
- [ ] Health check (`/actuator/health` via Spring Boot Actuator)
- [ ] CI/CD (build + testes no push)
- [ ] Profile de produção (`application-prod.yml`)
- [ ] HTTPS (TLS) obrigatório

## Documentação

- [ ] Swagger/OpenAPI (`springdoc-openapi`)
- [ ] README atualizado

### categorias
    MORADIA,
    COMER_FORA,
    ALIMENTACAO_MERCADO,
    TRANSPORTE_PUBLICO,
    TRANSPORTE_APPS,
    REMEDIOS,
    SAUDE,
    EDUCACAO,
    LAZER,
    ASSINATURAS,
    DESPESAS_PESSOAIS,
    COMPRAS,
    DIVIDAS,
    EXTRA,
    SEM_CATEGORIA