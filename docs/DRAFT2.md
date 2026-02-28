# Próximos Passos — auth-api

## 1. Banco de dados real
Trocar o repositório in-memory por um banco real (PostgreSQL com Prisma, por exemplo).
A arquitetura de repositório já está preparada — basta criar um `UserPrismaRepository`
implementando a mesma interface `UserRepository`.

## 2. Injeção de dependência
Em vez de instanciar dependências direto no controller, usar um container de DI
(`tsyringe` ou `awilix`) ou ao menos uma factory por módulo:
```
modules/auth/auth.factory.ts  ← monta e conecta as dependências
```

## 3. Testes automatizados
A arquitetura de use cases facilita muito os testes:
- **Unitários**: testar use cases isolados com o repositório in-memory
- **E2E**: testar as rotas HTTP com `supertest`

## 4. Middleware de autenticação
Um middleware `authenticate.ts` que valida o JWT e injeta o `userId` no `req`,
necessário para proteger rotas futuras:
```
http/middlewares/authenticate.ts
```

## 5. Variáveis de ambiente tipadas por domínio
Separar configs por contexto em vez de tudo em um único `env`:
```
shared/config/jwt.config.ts
shared/config/database.config.ts
```

## 6. Rate limiting e segurança
- `express-rate-limit` nas rotas de auth para evitar brute force
- `helmet` para configurar headers de segurança HTTP

## 7. Logging estruturado
Trocar `console.error` por uma lib como `pino` — logs em JSON com nível,
timestamp e trace ID por request. Facilita monitoramento em produção.

## 8. Novos módulos
Com a estrutura modular atual, adicionar domínios é natural:
```
modules/
  auth/
  users/    ← perfil, atualização de senha
  posts/    ← qualquer outro domínio
```
