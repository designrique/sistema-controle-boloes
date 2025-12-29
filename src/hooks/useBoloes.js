import { useState, useCallback, useMemo } from 'react'
import useNocoDB from './useNocoDB'
import { formatCurrency, formatDate } from '../utils/formatters'

// ID da tabela de bolões - configurar no NocoDB
const TABLE_ID = import.meta.env.VITE_NOCODB_TABLE_ID || 'tblboloes'

export function useBoloes() {
  const {
    data: boloes,
    loading,
    error,
    pagination,
    refetch,
    create,
    update,
    remove,
  } = useNocoDB(TABLE_ID)

  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')

  // Filtrar bolões por status e busca
  const boloesFiltrados = useMemo(() => {
    let filtered = [...boloes]

    if (filtroStatus !== 'todos') {
      filtered = filtered.filter(b => b.status === filtroStatus)
    }

    if (busca.trim()) {
      const searchLower = busca.toLowerCase()
      filtered = filtered.filter(b =>
        b.nome_cliente?.toLowerCase().includes(searchLower) ||
        b.descricao_bolao?.toLowerCase().includes(searchLower) ||
        b.telefone?.includes(busca)
      )
    }

    return filtered
  }, [boloes, filtroStatus, busca])

  // Calcular totais
  const totais = useMemo(() => {
    const total = boloesFiltrados.reduce((acc, b) => acc + (parseFloat(b.valor) || 0), 0)
    const pago = boloesFiltrados
      .filter(b => b.status === 'Pago')
      .reduce((acc, b) => acc + (parseFloat(b.valor) || 0), 0)
    const pendente = boloesFiltrados
      .filter(b => b.status === 'Pendente')
      .reduce((acc, b) => acc + (parseFloat(b.valor) || 0), 0)

    return { total, pago, pendente }
  }, [boloesFiltrados])

  // Criar novo bolão
  const criarBolao = useCallback(async (dados) => {
    const dadosFormatados = {
      ...dados,
      status: dados.status || 'Pendente',
      valor: parseFloat(dados.valor),
      data_compra: dados.data_compra || new Date().toISOString().split('T')[0],
    }
    return await create(dadosFormatados)
  }, [create])

  // Atualizar bolão
  const atualizarBolao = useCallback(async (id, dados) => {
    const dadosFormatados = {
      ...dados,
      valor: parseFloat(dados.valor),
    }
    return await update(id, dadosFormatados)
  }, [update])

  // Excluir bolão
  const excluirBolao = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este bolão?')) {
      return await remove(id)
    }
  }, [remove])

  // Formatação para exibição
  const formatarBolao = useCallback((bolao) => ({
    ...bolao,
    valorFormatado: formatCurrency(bolao.valor),
    dataFormatada: formatDate(bolao.data_compra),
    statusBadge: bolao.status === 'Pago'
      ? { class: 'badge-success', label: 'Pago' }
      : { class: 'badge-warning', label: 'Pendente' },
  }), [])

  return {
    boloes,
    boloesFiltrados,
    loading,
    error,
    pagination,
    filtroStatus,
    setFiltroStatus,
    busca,
    setBusca,
    totais,
    refetch,
    criarBolao,
    atualizarBolao,
    excluirBolao,
    formatarBolao,
  }
}

export default useBoloes
