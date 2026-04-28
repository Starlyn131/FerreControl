var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var app = express();
var PORT = process.env.PORT || 3001;
var DATA_FILE = path.join(__dirname, 'ferrecontrol.json');

app.use(cors());
app.use(express.json());

// Leer datos
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return {
      "Productos": [],
      "Ventas": [],
      "Detalle_Venta": [],
      "Movimientos_Inventario": [],
      "Usuarios": [
        {"id": 1, "nombre": "Administrador", "email": "admin@ferrecontrol.com", "password": "admin123", "pin": "1234", "rol": "admin", "fecha_creacion": new Date().toISOString()},
        {"id": 2, "nombre": "Jefe/Gerente", "email": "gerente@ferrecontrol.com", "password": "gerente123", "pin": "2345", "rol": "gerente", "fecha_creacion": new Date().toISOString()},
        {"id": 3, "nombre": "Vendedor", "email": "vendedor@ferrecontrol.com", "password": "vendedor123", "pin": "3456", "rol": "vendedor", "fecha_creacion": new Date().toISOString()}
      ],
      "nextIds": {"productos": 1, "ventas": 1, "detalle": 1, "movimientos": 1, "usuarios": 4}
    };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Guardar datos
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// LOGIN
app.post('/api/login', function(req, res) {
  var data = readData();
  var email = req.body.email;
  var password = req.body.password;
  var pin = req.body.pin;
  
  var usuario = null;
  if (pin) {
    usuario = data.Usuarios.find(u => u.pin === pin);
  } else if (email && password) {
    usuario = data.Usuarios.find(u => u.email === email && u.password === password);
  }
  
  if (!usuario) {
    return res.status(401).json({"error": "Credenciales incorrectas"});
  }
  
  res.json({
    "message": "Login exitoso",
    "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "rol": usuario.rol}
  });
});

// USUARIOS
app.get('/api/usuarios', function(req, res) {
  var data = readData();
  res.json(data.Usuarios);
});

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

// PRODUCTOS
app.get('/api/productos', function(req, res) {
  var data = readData();
  res.json(data.Productos);
});

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
  var prod = data.Productos.find(p => p.id === id);
  if (!prod) return res.status(404).json({"error": "No encontrado"});
  
  Object.assign(prod, req.body);
  prod.id = id;
  saveData(data);
  res.json({"message": "Producto actualizado"});
});

app.delete('/api/productos/:id', function(req, res) {
  var data = readData();
  var id = parseInt(req.params.id);
  data.Productos = data.Productos.filter(p => p.id !== id);
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
  for (var i = 0; i < productos.length; i++) {
    total += productos[i].cantidad * productos[i].precio_unitario;
  }
  
  var cambio = monto_recibido - total;
  if (cambio < 0) cambio = 0;
  
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
    
    var prod = data.Productos.find(p => p.id === productos[j].producto_id);
    if (prod) {
      prod.stock -= productos[j].cantidad;
    }
  }
  
  saveData(data);
  res.json({"id": venta.id, "message": "Venta completada", "total": total, "cambio": cambio});
});

// DASHBOARD
app.get('/api/dashboard', function(req, res) {
  var data = readData();
  var hoy = new Date().toISOString().split('T')[0];
  
  var ventasHoy = data.Ventas.filter(v => v.fecha.startsWith(hoy));
  var ingresosHoy = ventasHoy.reduce(function(sum, v) { return sum + v.total; }, 0);
  
  var stockBajo = data.Productos.filter(p => p.stock <= p.stock_minimo).length;
  
  res.json({
    "productos": {"total": data.Productos.length, "stock_bajo": stockBajo},
    "ventas_hoy": {"ventas": ventasHoy.length, "ingresos": ingresosHoy}
  });
});

app.listen(PORT, function() {
  console.log('Servidor en puerto ' + PORT);
});
