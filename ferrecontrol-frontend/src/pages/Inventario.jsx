import { useState, useEffect, useRef } from 'react'
import API_URL from '../config'

function Inventario({ user }) {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState('')
  const [importPreview, setImportPreview] = useState([])
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio_compra: '',
    precio_venta: '',
    stock: 0,
    stock_minimo: 5,
    categoria: ''
  })

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = () => {
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const url = editingProduct ? API_URL + `/api/productos/${editingProduct.id}` : API_URL + '/api/productos'
    const method = editingProduct ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(res => res.json())
      .then(() => {
        setShowModal(false)
        setEditingProduct(null)
        resetForm()
        loadProductos()
      })
      .catch(err => console.error('Error:', err))
  }

  const handleEdit = (producto) => {
    setEditingProduct(producto)
    setFormData({
      codigo: producto.codigo || '',
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      categoria: producto.categoria || ''
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      fetch(API_URL + `/api/productos/${id}`, { method: 'DELETE' })
        .then(() => loadProductos())
        .catch(err => console.error('Error:', err))
    }
  }

  const resetForm = () => {
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio_compra: '',
      precio_venta: '',
      stock: 0,
      stock_minimo: 5,
      categoria: ''
    })
  }

  const openNewModal = () => {
    resetForm()
    setEditingProduct(null)
    setShowModal(true)
  }

  // Exportar inventario a CSV
  const exportarInventario = () => {
    const headers = ['Código', 'Nombre', 'Descripción', 'Precio Compra', 'Precio Venta', 'Stock', 'Stock Mínimo', 'Categoría']
    const rows = productos.map(p => [
      p.codigo || '',
      p.nombre,
      p.descripcion || '',
      p.precio_compra,
      p.precio_venta,
      p.stock,
      p.stock_minimo,
      p.categoria || ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Importar productos desde CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        alert('El archivo está vacío o no tiene el formato correcto')
        return
      }
      
      const preview = []
      for (let i = 1; i < Math.min(lines.length, 11); i++) {
        const cells = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim())
        if (cells.length >= 5) {
          preview.push({
            codigo: cells[0] || '',
            nombre: cells[1] || '',
            descripcion: cells[2] || '',
            precio_compra: parseFloat(cells[3]) || 0,
            precio_venta: parseFloat(cells[4]) || 0,
            stock: parseInt(cells[5]) || 0,
            stock_minimo: parseInt(cells[6]) || 5,
            categoria: cells[7] || ''
          })
        }
      }
      
      setImportPreview(preview)
      setShowImportModal(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const confirmarImportacion = () => {
    fetch(API_URL + '/api/productos/importar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productos: importPreview })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message)
        setShowImportModal(false)
        setImportPreview([])
        loadProductos()
      })
      .catch(err => {
        console.error('Error:', err)
        alert('Error al importar productos')
      })
  }

  const descargarPlantilla = () => {
    const headers = ['Código', 'Nombre', 'Descripción', 'Precio Compra', 'Precio Venta', 'Stock', 'Stock Mínimo', 'Categoría']
    const ejemplo = ['PROD001', 'Martillo', 'Martillo de carpintero', '150', '250', '10', '3', 'Herramientas']
    
    const csvContent = [
      headers.join(','),
      ejemplo.map(cell => `"${cell}"`).join(',')
    ].join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla_inventario.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-10">Cargando...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
        <div className="flex space-x-2">
          <button onClick={descargarPlantilla} className="btn-secondary text-sm">
            📥 Plantilla
          </button>
          <button onClick={() => fileInputRef.current.click()} className="btn-secondary text-sm">
            📤 Importar
          </button>
          <button onClick={exportarInventario} className="btn-secondary text-sm">
            📊 Exportar
          </button>
          <button onClick={openNewModal} className="btn-primary text-sm">
            + Nuevo Producto
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.txt"
            className="hidden"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productos.map(producto => (
                <tr key={producto.id} className={producto.stock <= producto.stock_minimo ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{producto.codigo || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{producto.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{producto.categoria || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RD$ {producto.precio_compra.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">RD$ {producto.precio_venta.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={producto.stock <= producto.stock_minimo ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                      {producto.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEdit(producto)} className="text-blue-600 hover:text-blue-900">Editar</button>
                    <button onClick={() => handleDelete(producto.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <input type="text" className="input-field w-full" value={formData.codigo}
                    onChange={e => setFormData({...formData, codigo: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                  <input type="text" required className="input-field w-full" value={formData.nombre}
                    onChange={e => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <textarea className="input-field w-full" value={formData.descripcion}
                    onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Compra *</label>
                    <input type="number" step="0.01" required className="input-field w-full" value={formData.precio_compra}
                      onChange={e => setFormData({...formData, precio_compra: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio Venta *</label>
                    <input type="number" step="0.01" required className="input-field w-full" value={formData.precio_venta}
                      onChange={e => setFormData({...formData, precio_venta: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input type="number" className="input-field w-full" value={formData.stock}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Mínimo</label>
                    <input type="number" className="input-field w-full" value={formData.stock_minimo}
                      onChange={e => setFormData({...formData, stock_minimo: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <input type="text" className="input-field w-full" value={formData.categoria}
                    onChange={e => setFormData({...formData, categoria: e.target.value})} />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">Confirmar Importación ({importPreview.length} productos)</h3>
            <div className="overflow-y-auto max-h-96 mb-4">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Código</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Precio Compra</th>
                    <th className="px-4 py-2 text-left">Precio Venta</th>
                    <th className="px-4 py-2 text-left">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((p, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-2">{p.codigo}</td>
                      <td className="px-4 py-2">{p.nombre}</td>
                      <td className="px-4 py-2">RD$ {p.precio_compra.toFixed(2)}</td>
                      <td className="px-4 py-2">RD$ {p.precio_venta.toFixed(2)}</td>
                      <td className="px-4 py-2">{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => { setShowImportModal(false); setImportPreview([]) }} className="btn-secondary">Cancelar</button>
              <button onClick={confirmarImportacion} className="btn-primary">Importar Productos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventario
