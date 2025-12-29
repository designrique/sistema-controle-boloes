import Card from '../UI/Card'

const StatsCard = ({ title, value, icon, color = 'primary', loading }) => {
  const colors = {
    primary: 'bg-blue-50 text-primary',
    secondary: 'bg-yellow-50 text-secondary',
    success: 'bg-emerald-50 text-success',
    warning: 'bg-orange-50 text-warning',
  }

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-lg ${colors[color]} opacity-50`} />
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card hover>
      <div className="flex items-center">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}

export default StatsCard
