import { useState, useEffect } from 'react'
import API_URL from '../config'

function Ventas() {
  const [productos, setProductos] = useState([])
  const [carrito, setCarrito] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [montoRecibido, setMontoRecibido] = useState('')
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    fetch(API_URL + '/api/productos')
      .then(res => res.json())
      .then(data => {
        setProductos(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo && p.codigo.toLowerCase().includes(busqueda.toLowerCase()))
  )

  const agregarAlCarrito = (producto) => {
    if (producto.stock <= 0) {
      setMensaje('Producto sin stock disponible')
      setTimeout(() => setMensaje(''), 3000)
      return
    }

    const existe = carrito.find(item => item.producto_id === producto.id)
    if (existe) {
      if (existe.cantidad >= producto.stock) {
        setMensaje('No hay suficiente stock')
        setTimeout(() => setMensaje(''), 3000)
        return
      }
      setCarrito(carrito.map(item =>
        item.producto_id === producto.id
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
          : item
      ))
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigo,
        precio_unitario: producto.precio_venta,
        cantidad: 1,
        subtotal: producto.precio_venta,
        stock_disponible: producto.stock
      }])
    }
  }

  const removerDelCarrito = (producto_id) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id))
  }

  const actualizarCantidad = (producto_id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      removerDelCarrito(producto_id)
      return
    }

    const producto = productos.find(p => p.id === producto_id)
    if (nuevaCantidad > producto.stock) {
      setMensaje('No hay suficiente stock')
      setTimeout(() => setMensaje(''), 3000)
      return
    }

    setCarrito(carrito.map(item =>
      item.producto_id === producto_id
        ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precio_unitario }
        : item
    ))
  }

  const totalVenta = carrito.reduce((sum, item) => sum + item.subtotal, 0)
  const cambio = metodoPago === 'efectivo' && montoRecibido ? parseFloat(montoRecibido) - totalVenta : 0

  const procesarVenta = () => {
    if (carrito.length === 0) {
      setMensaje('Agrega productos al carrito')
      return
    }

    if (metodoPago === 'efectivo' && (!montoRecibido || parseFloat(montoRecibido) < totalVenta)) {
      setMensaje('El monto recibido debe ser mayor o igual al total')
      return
    }

    fetch(API_URL + '/api/ventas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productos: carrito.map(item => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        })),
        metodo_pago: metodoPago,
        monto_recibido: metodoPago === 'efectivo' ? parseFloat(montoRecibido) : null
      })
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(`Venta #${data.id} completada. Total: RD$ ${data.total.toFixed(2)}`)
        setCarrito([])
        setMontoRecibido('')
        setBusqueda('')
        setTimeout(() => setMensaje(''), 5000)
      })
      .catch(err => {
        console.error('Error:', err)
        setMensaje('Error al procesar la venta')
      })
  }

  if (loading) return <div className="text-center py-10">Cargando...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">POS - Ventas</h2>

      {mensaje && (
        <div className={`mb-4 p-4 rounded-lg ${mensaje.includes('completada') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card mb-4">
            <input
              type="text"
              placeholder="Buscar producto por nombre o código..."
              className="input-field w-full"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className="card max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {productosFiltrados.map(producto => (
                <div
                  key={producto.id}
                  onClick={() => agregarAlCarrito(producto)}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors ${producto.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-gray-900">{producto.nombre}</div>
                  <div className="text-sm text-gray-500">{producto.codigo || 'Sin código'}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-blue-600 font-bold">RD$ {producto.precio_venta.toFixed(2)}</span>
                    <span className={`text-sm ${producto.stock <= producto.stock_minimo ? 'text-red-600' : 'text-gray-600'}`}>
                      Stock: {producto.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Carrito de Venta</h3>
          
          {carrito.length === 0 ? (
            <p className="text-gray-500 text-center py-4">El carrito está vacío</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {carrito.map(item => (
                  <div key={item.producto_id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.nombre}</div>
                      <div className="text-xs text-gray-500">{item.codigo}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                        className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">-</button>
                      <span className="w-8 text-center">{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                        className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center">+</button>
                      <button onClick={() => removerDelCarrito(item.producto_id)}
                        className="text-red-500 ml-2">×</button>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-semibold">RD$ {item.subtotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>RD$ {totalVenta.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
                  <select
                    className="input-field w-full"
                    value={metodoPago}
                    onChange={e => setMetodoPago(e.target.value)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>

                {metodoPago === 'efectivo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Recibido</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field w-full"
                      value={montoRecibido}
                      onChange={e => setMontoRecibido(e.target.value)}
                      placeholder="0.00"
                    />
                    {cambio > 0 && (
                      <div className="mt-2 text-sm text-green-600">
                        Cambio: RD$ {cambio.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={procesarVenta} className="btn-primary w-full">
                  Procesar Venta
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Ventas
