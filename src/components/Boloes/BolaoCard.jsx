import { useState } from 'react'
import Card from '../UI/Card'
import Badge from '../UI/Badge'
import Button from '../UI/Button'
import { formatCurrency, formatPhone } from '../../utils/formatters'

const BolaoCard = ({ bolao, onEdit, onDelete, onStatusChange }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const statusVariant = bolao.status === 'Pago' ? 'success' : 'warning'

  return (
    <Card hover className="relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{bolao.nome_cliente}</h3>
          <p className="text-sm text-gray-500">{bolao.descricao_bolao}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-20 py-1">
                <button
                  onClick={() => {
                    onEdit(bolao)
                    setMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    onStatusChange(bolao)
                    setMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  {bolao.status === 'Pago' ? 'Marcar como Pendente' : 'Marcar como Pago'}
                </button>
                <button
                  onClick={() => {
                    onDelete(bolao)
                    setMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Valor:</span>
          <span className="font-mono font-semibold text-gray-900">
            {formatCurrency(bolao.valor)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Pagamento:</span>
          <span className="text-gray-900">{bolao.tipo_pagamento}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Conta:</span>
          <span className="text-gray-900">{bolao.conta_bancaria}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Data:</span>
          <span className="text-gray-900">{bolao.dataFormatada || bolao.data_compra}</span>
        </div>
        {bolao.telefone && (
          <div className="flex justify-between">
            <span className="text-gray-500">Telefone:</span>
            <span className="text-gray-900">{formatPhone(bolao.telefone)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <Badge variant={statusVariant}>{bolao.status}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(bolao)}
        >
          Editar
        </Button>
      </div>
    </Card>
  )
}

export default BolaoCard
