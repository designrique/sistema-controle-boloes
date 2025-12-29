import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/UI/Button'
import BolaoList from '../components/Boloes/BolaoList'
import BolaoFilters from '../components/Boloes/BolaoFilters'
import BolaoForm from '../components/Boloes/BolaoForm'
import Modal from '../components/UI/Modal'
import useBoloes from '../hooks/useBoloes'

const Boloes = () => {
  const navigate = useNavigate()
  const {
    boloesFiltrados: boloes,
    loading,
    filtroStatus,
    setFiltroStatus,
    busca,
    setBusca,
    criarBolao,
    atualizarBolao,
    excluirBolao,
    formatarBolao,
  } = useBoloes()

  const [modalOpen, setModalOpen] = useState(false)
  const [bolaoEditando, setBolaoEditando] = useState(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleNovoBolao = () => {
    setBolaoEditando(null)
    setModalOpen(true)
  }

  const handleEditar = (bolao) => {
    setBolaoEditando(bolao)
    setModalOpen(true)
  }

  const handleStatusChange = async (bolao) => {
    const novoStatus = bolao.status === 'Pago' ? 'Pendente' : 'Pago'
    try {
      await atualizarBolao(bolao.id, { ...bolao, status: novoStatus })
    } catch (error) {
      alert('Erro ao atualizar status: ' + error.message)
    }
  }

  const handleExcluir = async (bolao) => {
    try {
      await excluirBolao(bolao.id)
    } catch (error) {
      alert('Erro ao excluir bolão: ' + error.message)
    }
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    try {
      if (bolaoEditando) {
        await atualizarBolao(bolaoEditando.id, formData)
      } else {
        await criarBolao(formData)
      }
      setModalOpen(false)
      setBolaoEditando(null)
    } catch (error) {
      alert('Erro ao salvar bolão: ' + error.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setBolaoEditando(null)
  }

  const boloesFormatados = boloes.map(formatarBolao)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bolões</h1>
          <p className="text-gray-500">
            Gerencie todos os bolões ({boloes.length} registros)
          </p>
        </div>
        <Button variant="success" onClick={handleNovoBolao}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Bolão
        </Button>
      </div>

      {/* Filters */}
      <BolaoFilters
        busca={busca}
        onBuscaChange={setBusca}
        filtroStatus={filtroStatus}
        onStatusChange={setFiltroStatus}
      />

      {/* List */}
      <BolaoList
        boloes={boloesFormatados}
        onEdit={handleEditar}
        onDelete={handleExcluir}
        onStatusChange={handleStatusChange}
        loading={loading}
      />

      {/* Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={bolaoEditando ? 'Editar Bolão' : 'Novo Bolão'}
        size="lg"
      >
        <BolaoForm
          bolao={bolaoEditando}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}

export default Boloes
