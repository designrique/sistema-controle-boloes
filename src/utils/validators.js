export function validateBolao(data) {
  const errors = {}

  // Nome do cliente
  if (!data.nome_cliente || !data.nome_cliente.trim()) {
    errors.nome_cliente = 'Nome do cliente é obrigatório'
  } else if (data.nome_cliente.length < 3) {
    errors.nome_cliente = 'Nome deve ter pelo menos 3 caracteres'
  }

  // Descrição do bolão
  if (!data.descricao_bolao || !data.descricao_bolao.trim()) {
    errors.descricao_bolao = 'Descrição do bolão é obrigatória'
  }

  // Valor
  if (!data.valor) {
    errors.valor = 'Valor é obrigatório'
  } else {
    const valor = parseFloat(data.valor)
    if (isNaN(valor)) {
      errors.valor = 'Valor deve ser um número válido'
    } else if (valor < 10) {
      errors.valor = 'Valor mínimo é R$ 10,00'
    }
  }

  // Tipo de pagamento
  if (!data.tipo_pagamento) {
    errors.tipo_pagamento = 'Tipo de pagamento é obrigatório'
  }

  // Conta bancária
  if (!data.conta_bancaria) {
    errors.conta_bancaria = 'Conta bancária é obrigatória'
  }

  // Data da compra
  if (data.data_compra) {
    const dataCompra = new Date(data.data_compra)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    if (dataCompra > hoje) {
      errors.data_compra = 'Data da compra não pode ser futura'
    }
  }

  // Telefone (opcional, mas se informado deve ser válido)
  if (data.telefone) {
    const telefoneLimpo = data.telefone.replace(/\D/g, '')
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      errors.telefone = 'Telefone inválido'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function getFieldError(error, fieldName) {
  return error?.errors?.[fieldName] || null
}
