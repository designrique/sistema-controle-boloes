import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    {
      section: 'Principal',
      items: [
        { path: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      ],
    },
    {
      section: 'Gestão',
      items: [
        { path: '/boloes', label: 'Bolões', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { path: '/novo-bolao', label: 'Novo Bolão', icon: 'M12 4v16m8-8H4' },
      ],
    },
  ]

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-heading font-bold text-xl">L</span>
        </div>
        <div>
          <h1 className="font-heading font-bold text-gray-900">Loteria</h1>
          <p className="text-xs text-gray-500">Encruzilhada</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        {menuItems.map((section) => (
          <div key={section.section}>
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${location.pathname === item.path
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">admin@loteria.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
