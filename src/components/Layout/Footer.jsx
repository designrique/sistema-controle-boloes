const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Loteria Encruzilhada. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-400">
            Sistema de Controle de Bolões v1.0
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
