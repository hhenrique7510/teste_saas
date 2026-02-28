# SaaS Dashboard

Painel de métricas e relatórios com Next.js, PostgreSQL e NextAuth.

## Pré-requisitos

- Node.js 18+
- PostgreSQL

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Crie um ficheiro `.env` com as variáveis (use `.env.example` como base):

```bash
cp .env.example .env
```

Edite `.env` e defina:

- `DATABASE_URL` — URL de conexão ao PostgreSQL (ex: `postgresql://user:password@localhost:5432/saas_dashboard`)
- `NEXTAUTH_SECRET` — string aleatória para assinatura de sessões (ex: `openssl rand -base64 32`)
- `NEXTAUTH_URL` — URL da aplicação (ex: `http://localhost:3000` em desenvolvimento)

3. Execute as migrações e o seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para testar, use o utilizador criado pelo seed:

- **Email:** demo@example.com  
- **Password:** demo123

## Scripts

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | Executar ESLint |
| `npm run db:generate` | Gerar Prisma Client |
| `npm run db:migrate` | Aplicar migrações |
| `npm run db:seed` | Popular base de dados com dados de exemplo |

## Estrutura

- **Autenticação:** NextAuth (Credentials) com sessão JWT; registo via `/api/auth/register`.
- **Dashboard:** Overview (KPIs e gráficos), Métricas, Relatórios (placeholder), Configurações.
- **APIs:** `/api/dashboard` (agregados para a overview), `/api/metricas` (GET/POST com sessão).
- **Stripe:** Checkout de assinaturas (mensal/anual), portal de faturação e webhooks para manter o estado da subscrição na base de dados.

## Stripe (assinaturas)

1. Crie uma conta em [stripe.com](https://stripe.com) e obtenha as chaves em Developers → API keys.
2. No .env, defina:
   - `STRIPE_SECRET_KEY` — chave secreta (sk_test_... em modo teste).
   - `STRIPE_PRICE_ID_MONTHLY` e `STRIPE_PRICE_ID_YEARLY` — IDs dos preços de assinatura criados no Stripe (Dashboard → Products → preços recorrentes).
3. **Webhook:** Em Developers → Webhooks, adicione um endpoint com URL `https://seu-dominio.com/api/stripe/webhook` e selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`  
   Copie o signing secret para `STRIPE_WEBHOOK_SECRET` no .env.
4. Em desenvolvimento use o Stripe CLI para reencaminhar webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

Depois de aplicar a migração (`db:migrate`), a página **Plano e faturação** no dashboard permite subscrever (mensal/anual) e gerir a assinatura no portal Stripe.

## Deploy na Vercel

1. **Código no Git**  
   Cria um repositório no GitHub/GitLab/Bitbucket e envia o projeto:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TEU_USER/TEU_REPO.git
   git push -u origin main
   ```

2. **Base de dados em produção**  
   Usa um PostgreSQL gerido (a Vercel não inclui BD). Opções gratuitas:
   - [Neon](https://neon.tech) — cria uma base e copia a **Connection string**.
   - [Vercel Postgres](https://vercel.com/storage/postgres) (Neon integrado).
   - [Supabase](https://supabase.com) — Database → Connection string (URI).

3. **Projeto na Vercel**  
   - [vercel.com](https://vercel.com) → **Add New** → **Project**.
   - Importa o repositório Git.
   - **Framework Preset:** Next.js (detetado automaticamente).
   - Em **Environment Variables** adiciona (para Production):

   | Nome | Valor |
   |------|--------|
   | `DATABASE_URL` | URL PostgreSQL de produção (ex.: Neon/Supabase) |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` (gera um novo para produção) |
   | `NEXTAUTH_URL` | `https://o-teu-projeto.vercel.app` (ajusta após o 1.º deploy) |
   | `STRIPE_SECRET_KEY` | `sk_live_...` (produção) ou `sk_test_...` (testes) |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` do webhook (ver passo 5) |
   | `STRIPE_PRICE_ID_MONTHLY` | `price_...` |
   | `STRIPE_PRICE_ID_YEARLY` | `price_...` (opcional) |

   Depois do primeiro deploy, a Vercel mostra o URL (ex.: `https://saas-dashboard-xxx.vercel.app`). Atualiza `NEXTAUTH_URL` para esse URL e faz **Redeploy**.

4. **Migrações na base de produção**  
   Uma vez (localmente) com `DATABASE_URL` apontando para a BD de produção:
   ```bash
   DATABASE_URL="postgresql://..." npm run db:migrate
   ```
   Ou usa o script de migração da Neon/Supabase se tiverem.

5. **Webhook Stripe para produção**  
   No Stripe (Live ou Test): **Developers** → **Webhooks** → **Add endpoint**  
   - URL: `https://o-teu-projeto.vercel.app/api/stripe/webhook`  
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`  
   Copia o **Signing secret** e coloca em `STRIPE_WEBHOOK_SECRET` na Vercel → **Redeploy**.
