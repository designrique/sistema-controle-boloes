import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Layout/Header'
import Sidebar from './components/Layout/Sidebar'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Boloes from './pages/Boloes'
import NovoBolao from './pages/NovoBolao'

function Layout({ children }) {
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
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/boloes"
          element={
            <Layout>
              <Boloes />
            </Layout>
          }
        />
        <Route
          path="/novo-bolao"
          element={
            <Layout>
              <NovoBolao />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
