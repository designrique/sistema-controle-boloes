# 🎱 Sistema de Controle de Bolões - Loteria Encruzilhada

## Visão Geral do Projeto

Sistema web para controle de vendas de bolões da Loteria Encruzilhada, integrado com NocoDB como backend/banco de dados.

## Stack Tecnológica

- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend/DB:** NocoDB (API REST)
- **Hospedagem:** A definir (sugestão: Vercel/Netlify para frontend)

## Configurações do NocoDB

```
URL Base: https://crm.loteriaencruzilhada.com.br
API Token: B1coR8-qvU76NyCOCJRNpE0Wt4n33L2cqhid5GYC
Workspace: Loterica
Tabela: Boloes (a ser criada)
```

## Estrutura da Tabela "Boloes"

| Campo | Tipo NocoDB | Obrigatório | Descrição |
|-------|-------------|-------------|-----------|
| id | Auto Number | Sim | ID único |
| nome_cliente | Single Line Text | Sim | Nome completo do cliente |
| telefone | Phone Number | Não | Telefone para contato |
| data_compra | Date | Sim | Data da venda |
| descricao_bolao | Single Line Text | Sim | Ex: "Mega-Sena 2800" |
| valor | Currency | Sim | Valor em R$ |
| tipo_pagamento | Single Select | Sim | PIX, Cartão de Crédito |
| conta_bancaria | Single Select | Sim | Asaas, Caixa Econômica |
| status | Single Select | Sim | Pago, Pendente |
| observacoes | Long Text | Não | Notas adicionais |
| created_at | Created Time | Auto | Data de criação |
| updated_at | Last Modified Time | Auto | Última atualização |

## Funcionalidades Principais

### MVP (Fase 1)
- [ ] Listar todos os bolões
- [ ] Cadastrar novo bolão
- [ ] Editar bolão existente
- [ ] Excluir bolão
- [ ] Filtrar por status (Pago/Pendente)
- [ ] Buscar por nome do cliente

### Fase 2
- [ ] Dashboard com totais (vendas do dia, semana, mês)
- [ ] Relatório por conta bancária
- [ ] Exportar para Excel/CSV
- [ ] Filtros avançados por período

### Fase 3
- [ ] Integração WhatsApp (notificações)
- [ ] Comprovante de venda (PDF)
- [ ] Multi-usuário com login

## Regras de Negócio

1. Todo bolão inicia com status "Pendente"
2. Valor mínimo do bolão: R$ 10,00
3. Descrição deve conter nome do jogo e concurso (ex: "Mega-Sena 2800")
4. Data da compra não pode ser futura

## Design System

### Cores da Marca
```css
--primary: #1E40AF;      /* Azul escuro - confiança */
--secondary: #F59E0B;    /* Amarelo/Dourado - sorte, loteria */
--success: #10B981;      /* Verde - pago */
--warning: #F59E0B;      /* Amarelo - pendente */
--danger: #EF4444;       /* Vermelho - cancelado */
--background: #F8FAFC;   /* Cinza claro */
--surface: #FFFFFF;      /* Branco */
--text-primary: #1E293B; /* Texto principal */
--text-secondary: #64748B; /* Texto secundário */
```

### Tipografia
- **Headings:** Poppins (bold)
- **Body:** Inter (regular)
- **Monospace:** JetBrains Mono (para valores)

### Componentes UI
- Cards com sombras suaves
- Botões arredondados (rounded-lg)
- Inputs com bordas visíveis no focus
- Tabelas com hover state
- Modais para formulários

## Estrutura de Pastas

```
boloes-system/
├── CLAUDE.md                 # Este arquivo
├── BACKUP.md                 # Histórico de mudanças
├── .env.example              # Variáveis de ambiente exemplo
├── .env                      # Variáveis de ambiente (não commitar)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Componente principal
│   ├── index.css             # Estilos globais + Tailwind
│   ├── config/
│   │   └── api.js            # Configuração NocoDB
│   ├── hooks/
│   │   ├── useBoloes.js      # Hook para CRUD de bolões
│   │   └── useNocoDB.js      # Hook genérico NocoDB
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   ├── Boloes/
│   │   │   ├── BolaoCard.jsx
│   │   │   ├── BolaoForm.jsx
│   │   │   ├── BolaoList.jsx
│   │   │   └── BolaoFilters.jsx
│   │   ├── UI/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Badge.jsx
│   │   └── Dashboard/
│   │       ├── StatsCard.jsx
│   │       └── RecentSales.jsx
│   ├── pages/
│   │   ├── Home.jsx          # Dashboard
│   │   ├── Boloes.jsx        # Lista de bolões
│   │   └── NovoBolao.jsx     # Formulário
│   ├── services/
│   │   └── nocodb.js         # Chamadas API NocoDB
│   └── utils/
│       ├── formatters.js     # Formatação de data, moeda
│       └── validators.js     # Validações de formulário
└── public/
    └── favicon.ico
```

## API NocoDB - Endpoints

### Base URL
```
https://crm.loteriaencruzilhada.com.br/api/v2
```

### Headers Padrão
```javascript
{
  "xc-token": "B1coR8-qvU76NyCOCJRNpE0Wt4n33L2cqhid5GYC",
  "Content-Type": "application/json"
}
```

### Endpoints (após criar tabela)

```
GET    /tables/{tableId}/records      # Listar todos
GET    /tables/{tableId}/records/{id} # Buscar um
POST   /tables/{tableId}/records      # Criar
PATCH  /tables/{tableId}/records/{id} # Atualizar
DELETE /tables/{tableId}/records/{id} # Deletar
```

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Convenções de Código

### Nomenclatura
- **Componentes:** PascalCase (ex: `BolaoCard.jsx`)
- **Hooks:** camelCase com prefixo "use" (ex: `useBoloes.js`)
- **Funções:** camelCase (ex: `handleSubmit`)
- **Constantes:** UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- **Arquivos CSS:** kebab-case (ex: `bolao-card.css`)

### Commits (Conventional Commits)
```
feat: adiciona formulário de novo bolão
fix: corrige cálculo de total
style: ajusta espaçamento do header
refactor: extrai lógica para hook useBoloes
docs: atualiza README com instruções
```

### Padrões React
- Componentes funcionais com hooks
- Props destructuring
- PropTypes ou TypeScript para tipagem
- Separar lógica (hooks) de apresentação (components)

## Checklist de Qualidade

Antes de cada entrega, verificar:

- [ ] Código sem erros no console
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Loading states implementados
- [ ] Tratamento de erros da API
- [ ] Validação de formulários
- [ ] Feedback visual para ações do usuário
- [ ] Código comentado onde necessário
- [ ] Sem console.log de debug

## Notas Importantes

1. **Segurança:** O token da API está exposto no frontend. Para produção, considerar um backend intermediário (Node.js/N8N) para proteger as credenciais.

2. **CORS:** Se houver problemas de CORS, verificar configurações do NocoDB ou usar proxy no Vite.

3. **Backup:** Sempre manter BACKUP.md atualizado com mudanças significativas.

4. **Testes:** Testar em múltiplos navegadores antes de deploy.

---

*Última atualização: Dezembro 2025*
*Desenvolvido para: Loteria Encruzilhada*