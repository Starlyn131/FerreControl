import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Ventas from './pages/Ventas'
import Reportes from './pages/Reportes'
import Configuracion from './pages/Configuracion'
import Login from './pages/Login'
import GestionUsuarios from './pages/GestionUsuarios'

function App() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('ferrecontrol_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('ferrecontrol_user')
    localStorage.removeItem('ferrecontrol_token')
    setUser(null)
    navigate('/login')
  }

  if (!user) {
    return <Login />
  }

  const isAdmin = user.rol === 'admin'
  const isGerente = user.rol === 'gerente' || isAdmin
  const isVendedor = user.rol === 'vendedor' || isGerente

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <NavLink to="/" className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
                  FerreControl
                </NavLink>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/inventario"
                  className={({ isActive }) =>
                    `${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                  }
                >
                  Inventario
                </NavLink>
                {isVendedor && (
                  <NavLink
                    to="/ventas"
                    className={({ isActive }) =>
                      `${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                    }
                  >
                    POS - Ventas
                  </NavLink>
                )}
                {isGerente && (
                  <NavLink
                    to="/reportes"
                    className={({ isActive }) =>
                      `${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                    }
                  >
                    Reportes
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink
                    to="/configuracion"
                    className={({ isActive }) =>
                      `${isActive ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`
                    }
                  >
                    Configuración
                  </NavLink>
                )}
                {/* Usuarios desahibilitado temporalmente */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.nombre} ({user.rol})</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventario" element={<Inventario user={user} />} />
          {isVendedor && <Route path="/ventas" element={<Ventas />} />}
          {isGerente && <Route path="/reportes" element={<Reportes />} />}
          {isAdmin && <Route path="/configuracion" element={<Configuracion />} />}
          {/* Usuarios desahibilitado temporalmente */}
        </Routes>
      </main>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center space-y-2">
        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">Soporte/dudas</span>
        <a
          href="https://wa.me/18295883890"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-colors flex items-center justify-center"
          title="Soporte por WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.74.46 3.45 1.34 4.96L2 22l5.25-1.38c1.45.76 3.08 1.19 4.79 1.19 5.46 0 9.9-4.44 9.9-9.9C21.94 6.44 17.5 2 12.04 2zm0 1.8c4.47 0 8.1 3.63 8.1 8.1 0 4.47-3.63 8.1-8.1 8.1-1.38 0-2.73-.35-3.92-1.01l-.28-.17-3.12.82.83-3.04-.18-.3C4.23 14.85 3.8 13.5 3.8 12.1c0-4.47 3.63-8.1 8.1-8.1h.14zm4.49 11.32c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.37-1.94-1.18-.72-.63-1.2-1.41-1.34-1.65-.14-.24-.02-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.58 3.84 3.4.54.23.96.37 1.28.47.54.17 1.02.15 1.4.09.42-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
          </svg>
        </a>
      </div>
    </div>
  )
}

export default App
