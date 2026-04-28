import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API_URL from '../config'

function Login() {
  const navigate = useNavigate()
  const [metodo, setMetodo] = useState('email') // 'email' o 'pin'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    pin: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = metodo === 'pin' 
      ? { pin: formData.pin }
      : { email: formData.email, password: formData.password }

    fetch(API_URL + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error('Respuesta inválida del servidor');
        }
      })
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          localStorage.setItem('ferrecontrol_user', JSON.stringify(data.usuario))
          localStorage.setItem('ferrecontrol_token', data.token)
          navigate('/')
          window.location.reload()
        }
      })
      .catch(err => {
        console.error('Error:', err)
        setError('Error de conexión o servidor')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            FerreControl
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Inicia sesión para continuar
          </p>
        </div>

        <div className="card">
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => { setMetodo('email'); setError('') }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                metodo === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => { setMetodo('pin'); setError('') }}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                metodo === 'pin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              PIN
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {metodo === 'email' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field w-full"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@ferrecontrol.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="input-field w-full"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">PIN de 4 dígitos</label>
                <input
                  type="password"
                  name="pin"
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  className="input-field w-full text-center text-2xl tracking-widest"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="****"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <p className="font-semibold">FerreControl - Sistema de Gestión</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
