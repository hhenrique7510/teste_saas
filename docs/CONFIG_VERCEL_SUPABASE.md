# Configuração Vercel + Supabase (para o projeto funcionar)

## Supabase

### 1. Projeto e base de dados
- Criar projeto em [supabase.com](https://supabase.com).
- Anotar a **password** da base de dados (definida ao criar o projeto). Se precisar: **Project Settings** → **Database** → **Reset database password**.

### 2. Connection string (para a Vercel)
- **Project Settings** → **Database** → **Connection string**.
- Escolher **Session pooler** (porta **5432**), não Direct nem Transaction (6543).
- Copiar a URI e substituir `[YOUR-PASSWORD]` pela password real.
- No **final** da URL juntar (sem espaços):  
  `?connect_timeout=10&connection_limit=1`  
  Exemplo:  
  `...postgres?connect_timeout=10&connection_limit=1`

### 3. Migrações (uma vez)
- Na tua máquina, com a **mesma** connection string (Session pooler, porta 5432):  
  `DATABASE_URL="postgresql://postgres.XXX:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres" npm run db:migrate`
- Ou executar manualmente no **SQL Editor** do Supabase os ficheiros em `prisma/migrations/*/migration.sql`.

### 4. RLS (opcional)
- Se o Supabase mostrar avisos de RLS, podes ativar RLS nas tabelas e criar políticas permissivas (ex.: `USING (true) WITH CHECK (true)`) para não bloquear a app. Não é obrigatório para o login funcionar.

---

## Vercel

### 1. Variáveis de ambiente (obrigatórias)

Em **Settings** → **Environment Variables** (Production), definir:

| Variável | Onde obter | Exemplo |
|----------|------------|---------|
| **DATABASE_URL** | Supabase → Database → Connection string → **Session pooler** (5432) + password + no final `?connect_timeout=10&connection_limit=1` | `postgresql://postgres.xxx:senha@aws-1-us-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10&connection_limit=1` |
| **NEXTAUTH_SECRET** | Gerar: no terminal `openssl rand -base64 32` | string longa em base64 |
| **NEXTAUTH_URL** | URL do teu deploy (após o 1.º deploy) | `https://testesaas75-xxx.vercel.app` |

**Importante para DATABASE_URL:**
- Sem espaços no início nem no fim.
- Sem espaço antes de `?` (senão o Prisma usa a base `postgres%20` e dá erro).
- Usar **Session pooler (porta 5432)** para evitar erros de “prepared statement” com Prisma.

### 2. Stripe (opcional; só se usares Plano e faturação)

| Variável | Onde obter |
|----------|------------|
| STRIPE_SECRET_KEY | Stripe Dashboard → Developers → API keys |
| STRIPE_WEBHOOK_SECRET | Stripe → Webhooks → Add endpoint (URL do teu site + `/api/stripe/webhook`) → Signing secret |
| STRIPE_PRICE_ID_MONTHLY | Stripe → Products → preço mensal → Price ID |
| STRIPE_PRICE_ID_YEARLY | (opcional) Preço anual → Price ID |

### 3. Depois de alterar variáveis
- Clicar em **Redeploy** (ou fazer um novo deploy) para as variáveis serem aplicadas.

---

## Resumo mínimo (para login e dashboard funcionarem)

**Supabase:** projeto criado, connection string **Session pooler (5432)** com password e `?connect_timeout=10&connection_limit=1`, migrações aplicadas.

**Vercel:** `DATABASE_URL` (Session pooler, sem espaços), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` = URL do site; depois **Redeploy**.

---

## Se o login continuar a “carregar” ou der timeout

- No plano **Hobby** a Vercel limita funções a **10 segundos**. Se a rota de auth passar disso (cold start + BD), a função é cortada.
- Confirma em **Vercel → Logs** se aparece **FUNCTION_INVOCATION_TIMEOUT** ou 504 ao fazer login.
- Soluções: garantir Session pooler + `connect_timeout=10`; em último caso **Vercel Pro** (até 60s) ou usar a rota **POST /api/debug-login** (com `LOGIN_DEBUG_SECRET`) para ver onde está o tempo (ver `docs/` ou README).
