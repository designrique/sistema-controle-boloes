import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/UI/Card'
import Button from '../components/UI/Button'
import StatsCard from '../components/Dashboard/StatsCard'
import useBoloes from '../hooks/useBoloes'
import { formatCurrency, formatDate } from '../utils/formatters'

const Home = () => {
  const {
    boloes,
    loading,
    totais,
    refetch,
  } = useBoloes()

  useEffect(() => {
    refetch()
  }, [refetch])

  const stats = [
    {
      title: 'Total de Vendas',
      value: formatCurrency(totais.total),
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'primary',
    },
    {
      title: 'Pago',
      value: formatCurrency(totais.pago),
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'success',
    },
    {
      title: 'Pendente',
      value: formatCurrency(totais.pendente),
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'warning',
    },
    {
      title: 'Total de Bolões',
      value: boloes.length,
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      color: 'secondary',
    },
  ]

  const recentBoloes = [...boloes]
    .sort((a, b) => new Date(b.created_at || b.data_compra) - new Date(a.created_at || a.data_compra))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Visão geral das vendas de bolões</p>
        </div>
        <Link to="/novo-bolao">
          <Button variant="success">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Bolão
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} loading={loading} />
        ))}
      </div>

      {/* Recent Sales */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Vendas Recentes</h2>
          <Link to="/boloes" className="text-sm text-primary hover:underline">
            Ver todos
          </Link>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
                <div className="h-4 bg-gray-200 rounded w-1/6" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : recentBoloes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma venda registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Bolão</th>
                  <th className="pb-3 font-medium">Valor</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentBoloes.map((bolao) => (
                  <tr key={bolao.id} className="text-sm">
                    <td className="py-3 text-gray-900">{bolao.nome_cliente}</td>
                    <td className="py-3 text-gray-600">{bolao.descricao_bolao}</td>
                    <td className="py-3 font-mono text-gray-900">
                      {formatCurrency(bolao.valor)}
                    </td>
                    <td className="py-3">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${bolao.status === 'Pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'}
                      `}>
                        {bolao.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600">
                      {formatDate(bolao.data_compra)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Home
