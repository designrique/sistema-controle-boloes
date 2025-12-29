# 🚀 Guia de Deploy - Netlify + Railway

## Arquitetura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│    NETLIFY      │ ───► │    RAILWAY      │ ───► │    NOCODB       │
│   (Frontend)    │      │  (Proxy API)    │      │   (Banco)       │
│                 │      │                 │      │                 │
│  React + Vite   │      │  Node/Express   │      │  Sua instância  │
│                 │      │  Token seguro   │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
     Público              Token protegido          Acesso restrito
```

---

## Passo 0: Criar Tabelas no NocoDB

Antes de fazer o deploy, crie as tabelas no NocoDB:

### Tabela "Usuarios"

| Campo | Tipo | Configuração |
|-------|------|--------------|
| nome | Single Line Text | Obrigatório |
| email | Email | Obrigatório, Único |
| senha | Single Line Text | Obrigatório |
| role | Single Select | Opções: admin, gerente, vendedor |
| ativo | Checkbox | Padrão: true |
| ultimo_acesso | DateTime | Opcional |

### Tabela "Boloes"

| Campo | Tipo | Configuração |
|-------|------|--------------|
| nome_cliente | Single Line Text | Obrigatório |
| telefone | Phone Number | Opcional |
| data_compra | Date | Obrigatório |
| descricao_bolao | Single Line Text | Obrigatório |
| valor | Currency | Obrigatório |
| tipo_pagamento | Single Select | Opções: PIX, Cartão de Crédito, Dinheiro |
| conta_bancaria | Single Select | Opções: Asaas, Caixa Econômica |
| status | Single Select | Opções: Pago, Pendente, Cancelado |
| observacoes | Long Text | Opcional |
| vendedor_id | Number | Obrigatório |
| vendedor_nome | Single Line Text | Obrigatório |

> 📝 **Anote os IDs das tabelas** - Você vai precisar deles na configuração do Railway.

---

## Passo 1: Deploy do Servidor Proxy no Railway

### 1.1 Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app) e faça login
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub repo"**
4. Conecte seu repositório (pasta `server/`)

### 1.2 Configurar Variáveis de Ambiente

No painel do Railway, vá em **Variables** e adicione:

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `NOCODB_BASE_URL` | `https://crm.loteriaencruzilhada.com.br/api/v2` | URL da API |
| `NOCODB_TOKEN` | `seu_token_secreto` | Token do NocoDB |
| `NOCODB_TABLE_ID` | `id_tabela_boloes` | ID da tabela Boloes |
| `NOCODB_TABLE_USUARIOS_ID` | `id_tabela_usuarios` | ID da tabela Usuarios |
| `JWT_SECRET` | `gerar_chave_segura` | Chave para tokens JWT |
| `JWT_EXPIRES_IN` | `8h` | Tempo de expiração |
| `ALLOWED_ORIGINS` | `https://seu-site.netlify.app` | URL do frontend |

> 💡 **Gerar JWT_SECRET:** Execute `openssl rand -base64 32` no terminal

### 1.3 Deploy Automático

O Railway faz deploy automático ao detectar:
- `package.json` com script `start`
- Arquivo `index.js` na raiz

### 1.4 Obter URL do Railway

Após o deploy, você receberá uma URL como:
```
https://boloes-api-production-xxxx.up.railway.app
```

**Guarde essa URL!** Você vai precisar no próximo passo.

---

## Passo 2: Deploy do Frontend no Netlify

### 2.1 Criar Site no Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **"Add new site"** → **"Import an existing project"**
3. Conecte seu repositório GitHub
4. Configure:
   - **Base directory:** (deixe vazio, build padrão)
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 2.2 Configurar Variáveis de Ambiente

Em **Site configuration** → **Environment variables**, adicione:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://sua-url-railway.up.railway.app/api` |

> Substitua pela URL real do Railway (Passo 1.4)

### 2.3 Fazer Deploy

Clique em **"Deploy site"** ou faça push no GitHub.

### 2.4 Obter URL do Netlify

Após o deploy, você terá uma URL como:
```
https://boloes-loteria.netlify.app
```

---

## Passo 3: Conectar Frontend ↔ Backend

### 3.1 Atualizar CORS no Railway

Volte ao Railway e atualize a variável:

| Variável | Valor |
|----------|-------|
| `ALLOWED_ORIGINS` | `https://boloes-loteria.netlify.app` |

> Use a URL real do seu site Netlify

### 3.2 Redesploy

O Railway faz redeploy automático ao alterar variáveis.

### 3.3 Testar Conexão

1. Acesse seu site no Netlify
2. Abra o DevTools (F12) → Console
3. Verifique se não há erros de CORS
4. Teste criar/listar bolões

---

## Passo 4: Setup Inicial (Criar Admin)

Após o deploy, você precisa criar o primeiro administrador:

### Opção A: Via Interface

1. Acesse `https://seu-site.netlify.app/setup`
2. Preencha nome, email e senha
3. Clique em "Criar Administrador"
4. Faça login com as credenciais criadas

### Opção B: Via API (curl)

```bash
curl -X POST https://sua-api-railway.up.railway.app/api/setup \
  -H "Content-Type: application/json" \
  -d '{"nome": "Admin", "email": "admin@loteria.com", "senha": "senha123"}'
```

> ⚠️ O setup só funciona **uma vez**. Após criar o primeiro admin, novos usuários devem ser criados pelo painel.

---

## Passo 5: Domínio Personalizado (Opcional)

### Netlify (Frontend)

1. **Domain settings** → **Add custom domain**
2. Adicione: `boloes.loteriaencruzilhada.com.br`
3. Configure DNS no Registro.br:
   ```
   CNAME boloes → seu-site.netlify.app
   ```

### Railway (API)

1. **Settings** → **Domains** → **Generate Domain**
2. Ou adicione domínio customizado: `api-boloes.loteriaencruzilhada.com.br`

### Atualizar Variáveis

Após configurar domínios, atualize:

**Railway:**
```
ALLOWED_ORIGINS=https://boloes.loteriaencruzilhada.com.br
```

**Netlify:**
```
VITE_API_URL=https://api-boloes.loteriaencruzilhada.com.br/api
```

---

## Checklist Final

### Railway (Backend)
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy funcionando (status: Active)
- [ ] Logs sem erros
- [ ] Endpoint `/api/health` retornando `{ status: ok }`

### Netlify (Frontend)
- [ ] Build passando
- [ ] Site acessível
- [ ] Variável `VITE_API_URL` configurada
- [ ] Console sem erros de CORS

### Integração
- [ ] ALLOWED_ORIGINS no Railway inclui URL do Netlify
- [ ] Frontend consegue listar bolões
- [ ] Frontend consegue criar bolões
- [ ] Frontend consegue atualizar/deletar

---

## Troubleshooting

### Erro de CORS

```
Access to fetch at 'https://...' has been blocked by CORS policy
```

**Solução:** Verifique se `ALLOWED_ORIGINS` no Railway contém exatamente a URL do Netlify (com https://, sem barra final).

### 502 Bad Gateway no Railway

**Soluções:**
1. Verifique os logs no Railway
2. Certifique que `PORT` não está hardcoded (Railway define automaticamente)
3. Verifique se o servidor está escutando em `0.0.0.0`

### Variáveis não carregando no Netlify

**Solução:** Variáveis com prefixo `VITE_` são expostas no build. Após alterar, faça redeploy:
1. **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### API retornando 500

**Soluções:**
1. Verifique se `NOCODB_TABLE_ID` está correto
2. Teste a conexão com NocoDB manualmente
3. Verifique logs do Railway

---

## Custos Estimados

| Serviço | Plano | Custo |
|---------|-------|-------|
| Netlify | Free | $0/mês |
| Railway | Free (500h/mês) | $0/mês |
| Railway | Hobby | ~$5/mês |
| Domínio .com.br | - | ~R$40/ano |

> O plano free do Railway pode hibernar após inatividade. Para produção, considere o plano Hobby.

---

## Comandos Úteis

```bash
# Testar API localmente
cd server && npm run dev

# Testar frontend localmente
cd client && npm run dev

# Ver logs do Railway
railway logs

# Forçar redeploy no Netlify
netlify deploy --prod
```

---

*Atualizado em: Dezembro 2025*
