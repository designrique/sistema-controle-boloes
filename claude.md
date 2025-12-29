# 🎱 Sistema de Controle de Bolões - Loteria Encruzilhada

## Visão Geral do Projeto

Sistema web para controle de vendas de bolões da Loteria Encruzilhada.

## Stack Tecnológica

- **Frontend:** React 18 + Vite + TailwindCSS (Netlify)
- **Backend/Proxy:** Node.js + Express (Railway)
- **Banco de Dados:** NocoDB

## ⚠️ Segurança

**IMPORTANTE:** As credenciais da API estão protegidas no servidor proxy.

- Token NocoDB: Configurado via variável de ambiente no Railway
- Nunca exponha credenciais no código frontend
- Veja `DEPLOY.md` para instruções de configuração

## Configurações do NocoDB

```
URL Base: https://crm.loteriaencruzilhada.com.br
Workspace: Loterica
Tabela: Boloes
```

> 🔒 Token e Table ID são configurados como variáveis de ambiente no Railway

## Estrutura da Tabela "Usuarios"

| Campo | Tipo NocoDB | Obrigatório | Descrição |
|-------|-------------|-------------|-----------|
| Id | Auto Number | Sim | ID único |
| nome | Single Line Text | Sim | Nome completo |
| email | Email | Sim | Email (único) |
| senha | Single Line Text | Sim | Hash bcrypt da senha |
| role | Single Select | Sim | admin, gerente, vendedor |
| ativo | Checkbox | Sim | Se o usuário está ativo |
| ultimo_acesso | DateTime | Não | Último login |
| created_at | Created Time | Auto | Data de criação |

### Permissões por Cargo

| Cargo | Usuários | Bolões | Relatórios |
|-------|----------|--------|------------|
| **Admin** | CRUD completo | CRUD todos | Ver todos |
| **Gerente** | Ver lista | CRUD todos | Ver todos |
| **Vendedor** | - | Criar + editar próprios | - |

## Estrutura da Tabela "Boloes"

| Campo | Tipo NocoDB | Obrigatório | Descrição |
|-------|-------------|-------------|-----------|
| Id | Auto Number | Sim | ID único |
| nome_cliente | Single Line Text | Sim | Nome completo do cliente |
| telefone | Phone Number | Não | Telefone para contato |
| data_compra | Date | Sim | Data da venda |
| descricao_bolao | Single Line Text | Sim | Ex: "Mega-Sena 2800" |
| valor | Currency | Sim | Valor em R$ |
| tipo_pagamento | Single Select | Sim | PIX, Cartão de Crédito, Dinheiro |
| conta_bancaria | Single Select | Sim | Asaas, Caixa Econômica |
| status | Single Select | Sim | Pago, Pendente, Cancelado |
| observacoes | Long Text | Não | Notas adicionais |
| vendedor_id | Number | Sim | ID do vendedor |
| vendedor_nome | Single Line Text | Sim | Nome do vendedor |
| created_at | Created Time | Auto | Data de criação |
| updated_at | Last Modified Time | Auto | Última atualização |

## Funcionalidades Principais

### MVP (Fase 1) - ✅ Concluído
- [x] Listar todos os bolões
- [x] Cadastrar novo bolão
- [x] Editar bolão existente
- [x] Excluir bolão
- [x] Filtrar por status (Pago/Pendente)
- [x] Buscar por nome do cliente
- [x] Sistema de autenticação JWT
- [x] Login/Logout
- [x] Gestão de usuários (Admin)

### Fase 2
- [ ] Dashboard com totais
- [ ] Relatório por conta bancária
- [ ] Exportar para Excel/CSV

## Regras de Negócio

1. Todo bolão inicia com status "Pendente"
2. Valor mínimo do bolão: R$ 10,00
3. Descrição deve conter nome do jogo e concurso
4. Data da compra não pode ser futura

## Estrutura de Pastas

```
sistema-controle-boloes/
├── CLAUDE.md                 # Este arquivo
├── DEPLOY.md                 # Guia de deploy
├── .gitignore
├── .env.example              # Variáveis de ambiente exemplo
├── package.json              # Frontend dependencies
├── vite.config.js
├── tailwind.config.js
├── netlify.toml              # Configuração Netlify
│
├── server/                   # API Proxy (Railway)
│   ├── index.js              # Servidor Express
│   ├── package.json          # Backend dependencies
│   ├── railway.json          # Configuração Railway
│   └── .env.example          # Variáveis de ambiente exemplo
│
└── src/                      # Frontend (React)
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── contexts/
    │   └── AuthContext.jsx   # Contexto de autenticação
    ├── services/
    │   └── api.js            # API service com JWT
    ├── components/
    │   ├── Auth/
    │   │   └── ProtectedRoutes.jsx
    │   ├── Boloes/
    │   ├── Dashboard/
    │   ├── Layout/
    │   └── UI/
    └── pages/
        ├── Home.jsx
        ├── Boloes.jsx
        ├── NovoBolao.jsx
        ├── Login.jsx
        ├── Setup.jsx
        └── Usuarios.jsx
```

## Deploy

| Componente | Plataforma | URL |
|------------|------------|-----|
| Frontend | Netlify | `https://[seu-site].netlify.app` |
| API Proxy | Railway | `https://[seu-projeto].up.railway.app` |
| Banco | NocoDB | `https://crm.loteriaencruzilhada.com.br` |

Veja **DEPLOY.md** para instruções completas.

## Comandos de Desenvolvimento

```bash
# Backend (Railway)
cd server && npm install && npm run dev

# Frontend (Netlify)
npm install && npm run dev
```

## Variáveis de Ambiente

### Railway (server/.env)
```
NOCODB_BASE_URL=...
NOCODB_TOKEN=...
NOCODB_TABLE_ID=...
NOCODB_TABLE_USUARIOS_ID=...
JWT_SECRET=...
JWT_EXPIRES_IN=8h
ALLOWED_ORIGINS=...
```

### Netlify
```
VITE_API_URL=...
```

---

*Última atualização: Dezembro 2025*
*Desenvolvido para: Loteria Encruzilhada*
