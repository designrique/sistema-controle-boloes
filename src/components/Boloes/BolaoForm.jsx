import { useState, useEffect } from 'react'
import Input from '../UI/Input'
import Select from '../UI/Select'
import Button from '../UI/Button'
import Card from '../UI/Card'
import { validateBolao } from '../../utils/validators'

const BolaoForm = ({ bolao, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    nome_cliente: '',
    telefone: '',
    data_compra: new Date().toISOString().split('T')[0],
    descricao_bolao: '',
    valor: '',
    tipo_pagamento: '',
    conta_bancaria: '',
    status: 'Pendente',
    observacoes: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (bolao) {
      setFormData({
        ...bolao,
        valor: bolao.valor ? String(bolao.valor).replace(',', '.') : '',
      })
    }
  }, [bolao])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? value : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validation = validateBolao(formData)

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    onSubmit(formData)
  }

  const tipoPagamentoOptions = [
    { value: 'PIX', label: 'PIX' },
    { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
    { value: 'Cartão de Débito', label: 'Cartão de Débito' },
    { value: 'Dinheiro', label: 'Dinheiro' },
  ]

  const contaBancariaOptions = [
    { value: 'Asaas', label: 'Asaas' },
    { value: 'Caixa Econômica', label: 'Caixa Econômica' },
    { value: 'Santander', label: 'Santander' },
    { value: 'Bradesco', label: 'Bradesco' },
    { value: 'Outro', label: 'Outro' },
  ]

  const statusOptions = [
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Pago', label: 'Pago' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <Card className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Nome do Cliente"
            name="nome_cliente"
            value={formData.nome_cliente}
            onChange={handleChange}
            error={errors.nome_cliente}
            required
          />

          <Input
            label="Telefone"
            name="telefone"
            type="tel"
            value={formData.telefone}
            onChange={handleChange}
            error={errors.telefone}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Descrição do Bolão"
            name="descricao_bolao"
            value={formData.descricao_bolao}
            onChange={handleChange}
            error={errors.descricao_bolao}
            placeholder="Ex: Mega-Sena 2800"
            required
          />

          <Input
            label="Valor (R$)"
            name="valor"
            type="number"
            step="0.01"
            min="10"
            value={formData.valor}
            onChange={handleChange}
            error={errors.valor}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Data da Compra"
            name="data_compra"
            type="date"
            value={formData.data_compra}
            onChange={handleChange}
            error={errors.data_compra}
            required
          />

          <Select
            label="Tipo de Pagamento"
            name="tipo_pagamento"
            value={formData.tipo_pagamento}
            onChange={handleChange}
            options={tipoPagamentoOptions}
            error={errors.tipo_pagamento}
            required
          />

          <Select
            label="Conta Bancária"
            name="conta_bancaria"
            value={formData.conta_bancaria}
            onChange={handleChange}
            options={contaBancariaOptions}
            error={errors.conta_bancaria}
            required
          />
        </div>

        {bolao && (
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Observações
          </label>
          <textarea
            name="observacoes"
            rows={3}
            value={formData.observacoes}
            onChange={handleChange}
            className="input"
            placeholder="Notas adicionais..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={bolao ? 'primary' : 'success'}
            loading={loading}
          >
            {bolao ? 'Salvar Alterações' : 'Cadastrar Bolão'}
          </Button>
        </div>
      </Card>
    </form>
  )
}

export default BolaoForm
