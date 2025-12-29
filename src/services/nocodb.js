import API_CONFIG from '../config/api'

const { baseUrl, headers, tableId } = API_CONFIG

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`

  const config = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  }

  const response = await fetch(url, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisição' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const nocodbService = {
  // Listar todos os registros
  async list(tableIdToUse = tableId, params = {}) {
    const queryParams = new URLSearchParams(params).toString()
    const endpoint = `/tables/${tableIdToUse}/records${queryParams ? `?${queryParams}` : ''}`
    return request(endpoint)
  },

  // Buscar um registro específico
  async get(id, tableIdToUse = tableId) {
    return request(`/tables/${tableIdToUse}/records/${id}`)
  },

  // Criar novo registro
  async create(data, tableIdToUse = tableId) {
    return request(`/tables/${tableIdToUse}/records`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Atualizar registro
  async update(id, data, tableIdToUse = tableId) {
    return request(`/tables/${tableIdToUse}/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Deletar registro
  async delete(id, tableIdToUse = tableId) {
    return request(`/tables/${tableIdToUse}/records/${id}`, {
      method: 'DELETE',
    })
  },
}

export default nocodbService
