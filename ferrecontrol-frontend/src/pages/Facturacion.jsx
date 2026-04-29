import { useState, useEffect } from 'react'
import API_URL from '../config'

function Facturacion() {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadFacturas() }, [])

  function loadFacturas() {
    fetch(API_URL + '/api/facturas')
      .then(res => res.json())
      .then(data => { setFacturas(data); setLoading(false) })
      .catch(err => { console.error('Error:', err); setError('Error cargando facturas'); setLoading(false) })
  }

  if (loading) return <div className="text-center py-10">Cargando facturas...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Facturación</h2>
        <button className="btn-primary text-sm">+ Nueva Factura</button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm">{error}</div>
      )}

      <div className="card overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">Número</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturas.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No hay facturas emitidas
                </td>
              </tr>
            ) : (
              facturas.map(factura => (
                <tr key={factura.id}>
                  <td className="px-6 py-4 text-sm">{factura.numero}</td>
                  <td className="px-6 py-4 text-sm">{new Date(factura.fecha).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm">{factura.cliente}</td>
                  <td className="px-6 py-4 text-sm font-medium">RD${factura.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${factura.estado === 'emitida' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {factura.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Ver</button>
                    <button className="text-green-600 hover:text-green-800 text-sm">PDF</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Facturacion
