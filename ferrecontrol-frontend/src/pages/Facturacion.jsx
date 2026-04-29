import { useState, useEffect } from 'react'
import API_URL from '../config'

function Facturacion() {
  const [facturas, setFacturas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [ventas, setVentas] = useState([])
  const [formData, setFormData] = useState({
    venta_id: '',
    cliente: 'Consumidor Final',
    rnc: '',
    subtotal: 0,
    impuesto: 0,
    total: 0
  })

  useEffect(() => { loadFacturas(); loadVentas() }, [])

  function loadFacturas() {
    fetch(API_URL + '/api/facturas')
      .then(res => res.json())
      .then(data => { setFacturas(data); setLoading(false) })
      .catch(err => { console.error('Error:', err); setError('Error cargando facturas'); setLoading(false) })
  }

  function loadVentas() {
    fetch(API_URL + '/api/ventas')
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(err => console.error('Error cargando ventas:', err))
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      venta_id: parseInt(formData.venta_id),
      cliente: formData.cliente,
      rnc: formData.rnc,
      subtotal: parseFloat(formData.subtotal),
      impuesto: parseFloat(formData.impuesto),
      total: parseFloat(formData.total)
    }

    fetch(API_URL + '/api/facturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(() => { setShowModal(false); loadFacturas() })
      .catch(err => { console.error('Error:', err); setError('Error generando factura') })
  }

  if (loading) return <div className="text-center py-10">Cargando facturas...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Facturación</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm">+ Nueva Factura</button>
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

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Nueva Factura</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm">Venta Relacionada</label>
                <select 
                  name="venta_id" 
                  value={formData.venta_id} 
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">Seleccionar venta...</option>
                  {ventas.map(v => (
                    <option key={v.id} value={v.id}>Venta #{v.id} - RD${v.total.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm">Cliente</label>
                <input 
                  type="text" 
                  name="cliente" 
                  value={formData.cliente} 
                  onChange={handleChange}
                  className="input-field w-full" 
                />
              </div>
              <div>
                <label className="block text-sm">RNC (Opcional)</label>
                <input 
                  type="text" 
                  name="rnc" 
                  value={formData.rnc} 
                  onChange={handleChange}
                  className="input-field w-full" 
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm">Subtotal</label>
                  <input 
                    type="number" 
                    name="subtotal" 
                    value={formData.subtotal} 
                    onChange={handleChange}
                    className="input-field w-full" 
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm">Impuesto (ITBIS)</label>
                  <input 
                    type="number" 
                    name="impuesto" 
                    value={formData.impuesto} 
                    onChange={handleChange}
                    className="input-field w-full" 
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm">Total</label>
                  <input 
                    type="number" 
                    name="total" 
                    value={formData.total} 
                    onChange={handleChange}
                    className="input-field w-full" 
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Generar Factura</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Facturacion
