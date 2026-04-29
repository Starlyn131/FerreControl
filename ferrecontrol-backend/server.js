var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var app = express();
var PORT = process.env.PORT || 3001;
var DATA_FILE = path.join(__dirname, 'ferrecontrol.json');

app.use(cors());
app.use(express.json());

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    var initial = {
      "Productos": [],
      "Ventas": [],
      "Detalle_Venta": [],
      "Movimientos_Inventario": [],
      "Usuarios": [
        {"id": 1, "nombre": "Administrador", "email": "admin@ferrecontrol.com", "password": "admin123", "pin": "1234", "rol": "admin"},
        {"id": 2, "nombre": "Jefe/Gerente", "email": "gerente@ferrecontrol.com", "password": "gerente123", "pin": "2345", "rol": "gerente"},
        {"id": 3, "nombre": "Vendedor", "email": "vendedor@ferrecontrol.com", "password": "vendedor123", "pin": "3456", "rol": "vendedor"}
      ],
      "nextIds": {"productos": 4, "ventas": 1, "detalle": 1, "movimientos": 1, "usuarios": 4}
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// LOGIN
app.post('/api/login', function(req, res) {
  var data = readData();
  var usuario = null;
  if (req.body.pin) {
    for (var i = 0; i < data.Usuarios.length; i++) {
      if (data.Usuarios[i].pin === req.body.pin) { usuario = data.Usuarios[i]; break; }
    }
  } else if (req.body.email && req.body.password) {
    for (var j = 0; j < data.Usuarios.length; j++) {
      if (data.Usuarios[j].email === req.body.email && data.Usuarios[j].password === req.body.password) { usuario = data.Usuarios[j]; break; }
    }
  }
  if (!usuario) return res.status(401).json({"error": "Credenciales incorrectas"});
  res.json({"message": "Login exitoso", "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "rol": usuario.rol}});
});

// USUARIOS
app.get('/api/usuarios', function(req, res) { res.json(readData().Usuarios); });

app.post('/api/usuarios', function(req, res) {
  var data = readData();
  var nuevo = {
    "id": data.nextIds.usuarios++,
    "nombre": req.body.nombre,
    "email": req.body.email,
    "password": req.body.password,
    "pin": req.body.pin,
    "rol": req.body.rol || 'vendedor',
    "fecha_creacion": new Date().toISOString()
  };
  data.Usuarios.push(nuevo);
  saveData(data);
  res.json({"id": nuevo.id, "message": "Usuario creado"});
});

app.put('/api/usuarios/:id', function(req, res) {
  var data = readData();
  var id = parseInt(req.params.id);
  var user = data.Usuarios.find(function(u) { return u.id === id; });
  if (!user) return res.status(404).json({"error": "No encontrado"});
  Object.assign(user, req.body);
  user.id = id;
  saveData(data);
  res.json({"message": "Usuario actualizado"});
});

app.delete('/api/usuarios/:id', function(req, res) {
  var data = readData();
  data.Usuarios = data.Usuarios.filter(function(u) { return u.id !== parseInt(req.params.id); });
  saveData(data);
  res.json({"message": "Usuario eliminado"});
});

// PRODUCTOS
app.get('/api/productos', function(req, res) { res.json(readData().Productos); });

app.post('/api/productos', function(req, res) {
  var data = readData();
  var nuevo = {
    "id": data.nextIds.productos++,
    "codigo": req.body.codigo || 'PROD' + Date.now(),
    "nombre": req.body.nombre,
    "descripcion": req.body.descripcion || '',
    "precio_compra": parseFloat(req.body.precio_compra) || 0,
    "precio_venta": parseFloat(req.body.precio_venta),
    "stock": parseInt(req.body.stock) || 0,
    "stock_minimo": parseInt(req.body.stock_minimo) || 5,
    "categoria": req.body.categoria || ''
  };
  data.Productos.push(nuevo);
  saveData(data);
  res.json({"id": nuevo.id, "message": "Producto creado"});
});

app.put('/api/productos/:id', function(req, res) {
  var data = readData();
  var id = parseInt(req.params.id);
  var prod = data.Productos.find(function(p) { return p.id === id; });
  if (!prod) return res.status(404).json({"error": "No encontrado"});
  Object.assign(prod, req.body);
  prod.id = id;
  saveData(data);
  res.json({"message": "Producto actualizado"});
});

app.delete('/api/productos/:id', function(req, res) {
  var data = readData();
  data.Productos = data.Productos.filter(function(p) { return p.id !== parseInt(req.params.id); });
  saveData(data);
  res.json({"message": "Producto eliminado"});
});

// VENTAS
app.post('/api/ventas', function(req, res) {
  var data = readData();
  var productos = req.body.productos;
  var metodo_pago = req.body.metodo_pago;
  var monto_recibido = parseFloat(req.body.monto_recibido) || 0;
  var total = 0;
  for (var i = 0; i < productos.length; i++) { total += productos[i].cantidad * productos[i].precio_unitario; }
  var cambio = monto_recibido > total ? monto_recibido - total : 0;
  var venta = {
    "id": data.nextIds.ventas++,
    "fecha": new Date().toISOString(),
    "total": total,
    "metodo_pago": metodo_pago,
    "monto_recibido": monto_recibido,
    "cambio": cambio,
    "estado": "completada"
  };
  data.Ventas.push(venta);
  for (var j = 0; j < productos.length; j++) {
    data.Detalle_Venta.push({
      "id": data.nextIds.detalle++,
      "venta_id": venta.id,
      "producto_id": productos[j].producto_id,
      "cantidad": productos[j].cantidad,
      "precio_unitario": productos[j].precio_unitario,
      "subtotal": productos[j].cantidad * productos[j].precio_unitario
    });
    var prod = data.Productos.find(function(p) { return p.id === productos[j].producto_id; });
    if (prod) prod.stock -= productos[j].cantidad;
  }
  saveData(data);
  res.json({"id": venta.id, "message": "Venta completada", "total": total, "cambio": cambio});
  });

// FACTURAS
app.get('/api/facturas', function(req, res) {
  var data = readData();
  res.json(data.Facturas || []);
});

app.post('/api/facturas', function(req, res) {
  var data = readData();
  if (!data.Facturas) data.Facturas = [];
  
  var nuevaFactura = {
    "id": data.nextIds.facturas++,
    "venta_id": req.body.venta_id,
    "numero": 'FAC-' + Date.now(),
    "fecha": new Date().toISOString(),
    "cliente": req.body.cliente || 'Consumidor Final',
    "rnc": req.body.rnc || '',
    "subtotal": req.body.subtotal,
    "impuesto": req.body.impuesto || 0,
    "total": req.body.total,
    "estado": 'emitida'
  };
  
  data.Facturas.push(nuevaFactura);
  saveData(data);
  res.json({"id": nuevaFactura.id, "message": "Factura generada", "numero": nuevaFactura.numero});
});

// DASHBOARD
app.get('/api/dashboard', function(req, res) {
  var data = readData();
  var hoy = new Date().toISOString().split('T')[0];
  var ventasHoy = data.Ventas.filter(function(v) { return v.fecha.startsWith(hoy); });
  var ingresosHoy = ventasHoy.reduce(function(s, v) { return s + v.total; }, 0);
  var stockBajo = data.Productos.filter(function(p) { return p.stock <= p.stock_minimo; }).length;
  res.json({
    "productos": {"total": data.Productos.length, "stock_bajo": stockBajo},
    "ventas_hoy": {"ventas": ventasHoy.length, "ingresos": ingresosHoy}
  });
});

app.listen(PORT, function() { console.log('Servidor en puerto ' + PORT); });
