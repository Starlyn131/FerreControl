import { useState, useEffect } from 'react'
import API_URL from '../config'

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', pin: '', rol: 'vendedor' })

  useEffect(function() { loadUsuarios() }, [])

  function loadUsuarios() {
    fetch(API_URL + '/api/usuarios')
      .then(function(res) { 
        if (!res.ok) throw new Error('Server error: ' + res.status);
        return res.json(); 
      })
      .then(function(data) { 
        if (data.error) {
          setError(data.error);
        } else {
          setUsuarios(data); 
        }
        setLoading(false); 
      })
      .catch(function(err) { 
        console.error('Error:', err); 
        setError('Error: ' + err.message);
        setLoading(false); 
      })
  }

  function handleSubmit(e) {
    e.preventDefault()
    var url = editingUser ? API_URL + '/api/usuarios/' + editingUser.id : API_URL + '/api/usuarios'
    var method = editingUser ? 'PUT' : 'POST'
    var dataToSend = Object.assign({}, formData)
    if (editingUser && !dataToSend.password) delete dataToSend.password

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
      .then(function(res) { return res.json() })
      .then(function() { setShowModal(false); setEditingUser(null); resetForm(); loadUsuarios() })
      .catch(function(err) { console.error('Error:', err) })
  }

  function handleEdit(usuario) {
    setEditingUser(usuario)
    setFormData({ nombre: usuario.nombre, email: usuario.email, password: '', pin: usuario.pin || '', rol: usuario.rol })
    setShowModal(true)
  }

  function handleDelete(id) {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      fetch(API_URL + '/api/usuarios/' + id, { method: 'DELETE' })
        .then(function() { loadUsuarios() })
        .catch(function(err) { console.error('Error:', err) })
    }
  }

  function resetForm() { setFormData({ nombre: '', email: '', password: '', pin: '', rol: 'vendedor' }) }
  function openNewModal() { resetForm(); setEditingUser(null); setShowModal(true) }

  if (loading) return React.createElement('div', { className: 'text-center py-10' }, 'Cargando...')

  return React.createElement('div', null,
    React.createElement('div', { className: 'flex justify-between items-center mb-6' },
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, 'Gestión de Usuarios'),
      React.createElement('button', { onClick: openNewModal, className: 'btn-primary text-sm' }, '+ Nuevo Usuario')
    ),
    React.createElement('div', { className: 'card overflow-hidden' },
      React.createElement('table', { className: 'min-w-full' },
        React.createElement('thead', { className: 'bg-gray-50' },
          React.createElement('tr', null,
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium' }, 'Nombre'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium' }, 'Email'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium' }, 'PIN'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium' }, 'Rol'),
            React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium' }, 'Acciones')
          )
        ),
        React.createElement('tbody', null,
          usuarios.map(function(usuario) {
            return React.createElement('tr', { key: usuario.id },
              React.createElement('td', { className: 'px-6 py-4 text-sm' }, usuario.nombre),
              React.createElement('td', { className: 'px-6 py-4 text-sm' }, usuario.email),
              React.createElement('td', { className: 'px-6 py-4 text-sm' }, usuario.pin || '-'),
              React.createElement('td', { className: 'px-6 py-4 text-sm' }, usuario.rol),
              React.createElement('td', { className: 'px-6 py-4 space-x-2' },
                React.createElement('button', { onClick: function() { handleEdit(usuario) }, className: 'text-blue-600' }, 'Editar'),
                usuario.rol !== 'admin' && React.createElement('button', { onClick: function() { handleDelete(usuario.id) }, className: 'text-red-600' }, 'Eliminar')
              )
            )
          })
        )
      )
    ),
    showModal && React.createElement('div', { className: 'fixed inset-0 bg-gray-600 bg-opacity-50 z-50' },
      React.createElement('div', { className: 'relative top-20 mx-auto p-5 w-96 bg-white rounded-md' },
        React.createElement('h3', { className: 'text-lg font-bold mb-4' }, (editingUser ? 'Editar' : 'Nuevo') + ' Usuario'),
        React.createElement('form', { onSubmit: handleSubmit },
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm' }, 'Nombre *'),
              React.createElement('input', {
                type: 'text', required: true, className: 'input-field w-full',
                value: formData.nombre,
                onChange: function(e) { setFormData(Object.assign({}, formData, { nombre: e.target.value })) }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm' }, 'Email *'),
              React.createElement('input', {
                type: 'email', required: true, className: 'input-field w-full',
                value: formData.email,
                onChange: function(e) { setFormData(Object.assign({}, formData, { email: e.target.value })) }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm' }, 'Contraseña'),
              React.createElement('input', {
                type: 'password', required: !editingUser, className: 'input-field w-full',
                value: formData.password,
                onChange: function(e) { setFormData(Object.assign({}, formData, { password: e.target.value })) }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm' }, 'PIN'),
              React.createElement('input', {
                type: 'text', maxLength: '4', className: 'input-field w-full',
                value: formData.pin,
                onChange: function(e) { setFormData(Object.assign({}, formData, { pin: e.target.value })) }
              })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm' }, 'Rol'),
              React.createElement('select', {
                className: 'input-field w-full',
                value: formData.rol,
                onChange: function(e) { setFormData(Object.assign({}, formData, { rol: e.target.value })) }
              },
                React.createElement('option', { value: 'vendedor' }, 'Vendedor'),
                React.createElement('option', { value: 'gerente' }, 'Jefe/Gerente'),
                React.createElement('option', { value: 'admin' }, 'Administrador')
              )
            )
          ),
          React.createElement('div', { className: 'mt-6 flex justify-end space-x-3' },
            React.createElement('button', { type: 'button', onClick: function() { setShowModal(false) }, className: 'btn-secondary' }, 'Cancelar'),
            React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Guardar')
          )
        )
      )
    )
  )
}

export default GestionUsuarios
