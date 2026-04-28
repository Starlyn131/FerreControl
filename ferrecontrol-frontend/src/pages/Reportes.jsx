import { useState, useEffect } from 'react'
import API_URL from '../config'

function Reportes() {
  const [ventasDiarias, setVentasDiarias] = useState(null)
  const [ventasMensuales, setVentasMensuales] = useState([])
  const [productosMasVendidos, setProductosMasVendidos] = useState([])
  const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarReportes()
  }, [])

  const cargarReportes = () => {
    setLoading(true)
    
    fetch(API_URL + `/api/reportes/ventas-diarias?fecha=${fechaReporte}`)
      .then(res => res.json())
      .then(data => {
        setVentasDiarias(data)
        
        fetch(API_URL + '/api/reportes/ventas-mensuales')
          .then(res => res.json())
          .then(data => setVentasMensuales(data))
          .catch(err => console.error(err))

        fetch(API_URL + '/api/reportes/productos-mas-vendidos')
          .then(res => res.json())
          .then(data => setProductosMasVendidos(data))
          .catch(err => console.error(err))
          .finally(() => setLoading(false))
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }

  const verReporteFecha = () => {
    fetch(API_URL + `/api/reportes/ventas-diarias?fecha=${fechaReporte}`)
      .then(res => res.json())
      .then(data => setVentasDiarias(data))
      .catch(err => console.error(err))
  }

  if (loading) return <div className="text-center py-10">Cargando reportes...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reportes</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Diarias</h3>
          <div className="flex space-x-2 mb-4">
            <input
              type="date"
              className="input-field flex-1"
              value={fechaReporte}
              onChange={e => setFechaReporte(e.target.value)}
            />
            <button onClick={verReporteFecha} className="btn-primary">Ver</button>
          </div>
          {ventasDiarias && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Ventas:</span>
                <span className="font-semibold">{ventasDiarias.total_ventas || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ingresos Totales:</span>
                <span className="font-semibold">RD$ {(ventasDiarias.ingresos_totales || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Promedio por Venta:</span>
                <span className="font-semibold">RD$ {(ventasDiarias.promedio_venta || 0).toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Mensual</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ventasMensuales.map((dia, idx) => (
              <div key={idx} className="flex justify-between py-2 border-b">
                <span className="text-gray-600">{dia.dia}</span>
                <div className="text-right">
                  <div className="font-semibold">{dia.total_ventas} ventas</div>
                  <div className="text-sm text-gray-500">RD$ {dia.ingresos_dia.toFixed(2)}</div>
                </div>
              </div>
            ))}
            {ventasMensuales.length === 0 && (
              <p className="text-gray-500 text-center py-4">No hay datos este mes</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Vendido</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {productosMasVendidos.map((prod, idx) => (
                <tr key={prod.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm">{prod.codigo || '-'}</td>
                  <td className="px-4 py-2 text-sm font-medium">{prod.nombre}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{prod.categoria || '-'}</td>
                  <td className="px-4 py-2 text-sm">{prod.total_vendido}</td>
                  <td className="px-4 py-2 text-sm font-semibold">RD$ {prod.ingresos_generados.toFixed(2)}</td>
                </tr>
              ))}
              {productosMasVendidos.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">No hay datos de ventas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reportes
