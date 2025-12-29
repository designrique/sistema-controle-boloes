import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import Footer from './components/Layout/Footer'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Home from './pages/Home'
import Boloes from './pages/Boloes'
import NovoBolao from './pages/NovoBolao'
import Usuarios from './pages/Usuarios'
import { PrivateRoute, AdminRoute, AccessDenied } from './components/Auth/ProtectedRoutes'
import { useAuth } from './contexts/AuthContext'

function Layout({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/acesso-negado" element={<AccessDenied />} />

        {/* Rotas protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout>
                <Home />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/boloes"
          element={
            <PrivateRoute>
              <Layout>
                <Boloes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/novo-bolao"
          element={
            <PrivateRoute>
              <Layout>
                <NovoBolao />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <AdminRoute>
              <Layout>
                <Usuarios />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Redirecionar rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
