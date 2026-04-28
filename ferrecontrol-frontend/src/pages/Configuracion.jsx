import { useState } from 'react'
import API_URL from '../config'

function Configuracion() {
  const [config, setConfig] = useState({
    nombre_negocio: 'Mi Ferretería',
    direccion: '',
    telefono: '',
    moneda: 'DOP',
    exportando: false
  })

  const handleChange = (e) => {
    setConfig({
      ...config,
      [e.target.name]: e.target.value
    })
  }

  const guardarConfig = () => {
    localStorage.setItem('ferrecontrol_config', JSON.stringify(config))
    alert('Configuración guardada')
  }

  const exportarDatos = () => {
    setConfig({...config, exportando: true})
    
    Promise.all([
      fetch(API_URL + '/api/productos').then(res => res.json()),
      fetch(API_URL + '/api/ventas').then(res => res.json()),
      fetch(API_URL + '/api/movimientos').then(res => res.json())
    ]).then(([productos, ventas, movimientos]) => {
      const datos = {
        productos,
        ventas,
        movimientos,
        fecha_exportacion: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ferrecontrol_backup_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      setConfig({...config, exportando: false})
    }).catch(err => {
      console.error('Error:', err)
      setConfig({...config, exportando: false})
      alert('Error al exportar datos')
    })
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Datos del Negocio</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Negocio</label>
              <input
                type="text"
                name="nombre_negocio"
                className="input-field w-full"
                value={config.nombre_negocio}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <textarea
                name="direccion"
                className="input-field w-full"
                value={config.direccion}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                name="telefono"
                className="input-field w-full"
                value={config.telefono}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Moneda</label>
              <select
                name="moneda"
                className="input-field w-full"
                value={config.moneda}
                onChange={handleChange}
              >
                <option value="DOP">Peso Dominicano (RD$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <button onClick={guardarConfig} className="btn-primary w-full">
              Guardar Configuración
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Gestión de Datos</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Puedes exportar todos los datos del sistema (productos, ventas, movimientos) como respaldo.
              </p>
            </div>
            <button
              onClick={exportarDatos}
              disabled={config.exportando}
              className="btn-primary w-full disabled:opacity-50"
            >
              {config.exportando ? 'Exportando...' : 'Exportar Datos (Backup)'}
            </button>
            
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Información del Sistema</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Sistema:</strong> FerreControl</p>
                <p><strong>Versión:</strong> 1.0.0 MVP</p>
                <p><strong>Base de Datos:</strong> SQLite (ferrecontrol.db)</p>
                <p><strong>Moneda:</strong> {config.moneda}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracion
