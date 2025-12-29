import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BolaoForm from '../components/Boloes/BolaoForm'
import Card from '../components/UI/Card'
import useBoloes from '../hooks/useBoloes'

const NovoBolao = () => {
  const navigate = useNavigate()
  const { criarBolao, loading } = useBoloes()
  const [submitError, setSubmitError] = useState(null)

  const handleSubmit = async (formData) => {
    setSubmitError(null)
    try {
      await criarBolao(formData)
      navigate('/boloes')
    } catch (error) {
      setSubmitError('Erro ao criar bolão: ' + error.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Bolão</h1>
        <p className="text-gray-500">Preencha os dados para cadastrar um novo bolão</p>
      </div>

      {/* Error Message */}
      {submitError && (
        <Card className="bg-red-50 border border-red-200">
          <p className="text-red-600">{submitError}</p>
        </Card>
      )}

      {/* Form */}
      <BolaoForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/boloes')}
        loading={loading}
      />
    </div>
  )
}

export default NovoBolao
