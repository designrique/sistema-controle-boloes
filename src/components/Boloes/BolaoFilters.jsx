import Input from '../UI/Input'
import Select from '../UI/Select'

const BolaoFilters = ({
  busca,
  onBuscaChange,
  filtroStatus,
  onStatusChange,
  className = '',
}) => {
  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Pendente', label: 'Pendente' },
  ]

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="flex-1">
        <Input
          type="search"
          placeholder="Buscar por nome, descrição ou telefone..."
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          options={statusOptions}
          value={filtroStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          placeholder="Status"
        />
      </div>
    </div>
  )
}

export default BolaoFilters
