const API_BASE_URL = import.meta.env.VITE_NOCODB_URL || 'https://crm.loteriaencruzilhada.com.br'
const API_TOKEN = import.meta.env.VITE_NOCODB_TOKEN || ''

// Table ID para a tabela "Boloes" - será definido após criar a tabela no NocoDB
const TABLE_ID = import.meta.env.VITE_NOCODB_TABLE_ID || 'tblXXXXXXXXXXXXXXXXXX'

export const API_CONFIG = {
  baseUrl: `${API_BASE_URL}/api/v2`,
  token: API_TOKEN,
  tableId: TABLE_ID,
  headers: {
    'xc-token': API_TOKEN,
    'Content-Type': 'application/json',
  },
}

export default API_CONFIG
