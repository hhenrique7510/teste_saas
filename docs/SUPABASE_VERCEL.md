# Supabase + Vercel – ligação à base de dados

Se o login (ou a app) ficar "a carregar" infinitamente em produção, a causa costuma ser a **ligação da Vercel ao Supabase** (lenta ou a falhar em silêncio).

**Recomendado para Vercel:** usar o **Session pooler (porta 5432)** em vez do Transaction (6543), para evitar erros de prepared statement e maior estabilidade.

## 1. Timeout na connection string

Na **Vercel** → **Settings** → **Environment Variables** → `DATABASE_URL`, garante que a URL termina com parâmetros de timeout e limite de conexões. Assim a ligação falha ao fim de ~15 s em vez de ficar pendurada.

- Se a URL **não** tiver `?`: acrescenta no final:
  ```
  ?connect_timeout=15&connection_limit=1
  ```
- Se já tiver `?alguma_coisa`: acrescenta:
  ```
  &connect_timeout=15&connection_limit=1
  ```

Exemplo completo (Session pooler):
```
postgresql://postgres.XXX:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?connect_timeout=15&connection_limit=1
```

## 2. Qual connection string usar na Vercel

Testa **por esta ordem**:

### A) Ligação direta (porta 5432, host `db.xxx.supabase.co`)

Nos servidores da Vercel esta ligação costuma funcionar mesmo quando no teu PC dá erro (ex.: IPv4).

- Supabase → **Project Settings** → **Database** → **Connection string** → **URI** → **Direct connection**
- Substitui `[YOUR-PASSWORD]` pela password da BD
- No final da URL: `?connect_timeout=15&connection_limit=1`

Exemplo:
```
postgresql://postgres:PASSWORD@db.lxjbsdytfvdjmgusefgd.supabase.co:5432/postgres?connect_timeout=15&connection_limit=1
```

### B) Session pooler (porta 5432, host `*.pooler.supabase.com`)

Se a direct não funcionar ou der timeout, usa a que usaste para as migrações (Session pooler).

- Connection string do **Session pooler** (porta 5432)
- No final: `?connect_timeout=15&connection_limit=1`

### C) Transaction pooler (porta 6543)

Se ainda estiver lento, experimenta o pooler em modo Transaction:

- Connection string do **Transaction** pooler (porta **6543**)
- No final: `?pgbouncer=true&connect_timeout=15&connection_limit=1`

## 3. Testar a ligação

Depois de alterar `DATABASE_URL` e fazer **Redeploy**, abre no browser:

```
https://O-TEU-DOMINIO.vercel.app/api/health
```

- Resposta rápida com `"db":"connected"` → a BD está acessível; se o login continuar lento, o problema é noutro ponto.
- Timeout ou erro → experimenta a opção seguinte (A → B → C) na secção 2.

## 4. Região do projeto Supabase

Cria o projeto Supabase numa região próxima da Vercel (ex.: **East US (North Virginia)** ou **South America** se usares Vercel na mesma zona). Projetos em regiões muito distantes aumentam a latência e o risco de timeouts.
