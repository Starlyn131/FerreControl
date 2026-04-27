var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var app = express();
var PORT = process.env.PORT || 3001;
var DB_FILE = path.join(__dirname, 'ferrecontrol.json');

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DB_FILE)) {
  var initialData = {
    Productos: [],
    Ventas: [],
    Detalle_Venta: [],
    Movimientos_Inventario: [],
    Usuarios: [
      { id: 1, nombre: 'Administrador', email: 'admin@ferrecontrol.com', password: 'admin123', pin: '1234', rol: 'admin' },
      { id: 2, nombre: 'Jefe/Gerente', email: 'gerente@ferrecontrol.com', password: 'gerente123', pin: '2345', rol: 'gerente' },
      { id: 3, nombre: 'Vendedor', email: 'vendedor@ferrecontrol.com', password: 'vendedor123', pin: '3456', rol: 'vendedor' }
    ],
    nextIds: { productos: 1, ventas: 1, detalle: 1, movimientos: 1, usuarios: 4 }
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generarCodigo() {
  var db = readDB();
  return 'PROD' + (db.Productos.length + 1).toString().padStart(3, '0');
}

// Login
app.post('/api/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var pin = req.body.pin;
  var db = readDB();
  var usuario = null;
  
  if (pin) {
    for (var i = 0; i < db.Usuarios.length; i++) {
      if (db.Usuarios[i].pin === pin) { usuario = db.Usuarios[i]; break; }
    }
  } else if (email && password) {
    for (var j = 0; j < db.Usuarios.length; j++) {
      if (db.Usuarios[j].email === email && db.Usuarios[j].password === password) { usuario = db.Usuarios[j]; break; }
    }
  }
  
  if (!usuario) { return res.status(401).json({ error: 'Credenciales incorrectas' }); }
  
  res.json({ 
    message: 'Login exitoso', 
    usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    token: 'fake-token-' + usuario.id 
  });
});

// Usuarios
app.get('/api/usuarios', function(req, res) {
  var db = readDB();
  var result = [];
  for (var i = 0; i < db.Usuarios.length; i++) {
    result.push({ id: db.Usuarios[i].id, nombre: db.Usuarios[i].nombre, email: db.Usuarios[i].email, pin: db.Usuarios[i].pin, rol: db.Usuarios[i].rol });
  }
  res.json(result);
});

app.post('/api/usuarios', function(req, res) {
  var db = readDB();
  var nuevo = {
    id: db.nextIds.usuarios++,
    nombre: req.body.nombre,
    email: req.body.email,
    password: req.body.password,
    pin: req.body.pin || null,
    rol: req.body.rol || 'vendedor'
  };
  db.Usuarios.push(nuevo);
  writeDB(db);
  res.json({ id: nuevo.id, message: 'Usuario creado' });
});

// Productos
app.get('/api/productos', function(req, res) {
  var db = readDB();
  res.json(db.Productos);
});

app.post('/api/productos', function(req, res) {
  var db = readDB();
  var nuevo = {
    id: db.nextIds.productos++,
    codigo: req.body.codigo || generarCodigo(),
    nombre: req.body.nombre,
    descripcion: req.body.descripcion || '',
    precio_compra: parseFloat(req.body.precio_compra) || 0,
    precio_venta: parseFloat(req.body.precio_venta),
    stock: parseInt(req.body.stock) || 0,
    stock_minimo: parseInt(req.body.stock_minimo) || 5,
    categoria: req.body.categoria || ''
  };
  db.Productos.push(nuevo);
  writeDB(db);
  res.json({ id: nuevo.id, message: 'Producto creado' });
});

// Ventas
app.post('/api/ventas', function(req, res) {
  var db = readDB();
  var productos = req.body.productos;
  var total = 0;
  for (var i = 0; i < productos.length; i++) { total += productos[i].cantidad * productos[i].precio_unitario; }
  
  var venta = {
    id: db.nextIds.ventas++,
    fecha: new Date().toISOString(),
    total: total,
    metodo_pago: req.body.metodo_pago,
    estado: 'completada'
  };
  db.Ventas.push(venta);
  writeDB(db);
  res.json({ id: venta.id, message: 'Venta completada' });
});

// Dashboard
app.get('/api/dashboard', function(req, res) {
  var db = readDB();
  var hoy = new Date().toISOString().split('T')[0];
  var ventasHoy = 0;
  var ingresosHoy = 0;
  for (var i = 0; i < db.Ventas.length; i++) {
    if (db.Ventas[i].fecha.startsWith(hoy)) { ventasHoy++; ingresosHoy += db.Ventas[i].total; }
  }
  res.json({
    productos: { total: db.Productos.length },
    ventas_hoy: { ventas: ventasHoy, ingresos: ingresosHoy }
  });
});

app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor en http://0.0.0.0:' + PORT);
});
