var express = require('express');
var cors = require('cors');
var sql = require('sql.js');

var app = express();
var PORT = 3001;
var DB_FILE = 'ferrecontrol.db';

app.use(cors());
app.use(express.json());

// Inicializar base de datos
var db = sql.open(DB_FILE);

// Crear tablas si no existen
db.run("CREATE TABLE IF NOT EXISTS Usuarios (id INTEGER PRIMARY KEY, nombre TEXT, email TEXT UNIQUE, password TEXT, pin TEXT, rol TEXT)");
db.run("CREATE TABLE IF NOT EXISTS Productos (id INTEGER PRIMARY KEY, codigo TEXT, nombre TEXT, descripcion TEXT, precio_compra REAL, precio_venta REAL, stock INTEGER DEFAULT 0, stock_minimo INTEGER DEFAULT 5, categoria TEXT)");
db.run("CREATE TABLE IF NOT EXISTS Ventas (id INTEGER PRIMARY KEY, fecha TEXT, total REAL, metodo_pago TEXT, monto_recibido REAL, cambio REAL, estado TEXT)");
db.run("CREATE TABLE IF NOT EXISTS Detalle_Venta (id INTEGER PRIMARY KEY, venta_id INTEGER, producto_id INTEGER, cantidad INTEGER, precio_unitario REAL, subtotal REAL)");
db.run("CREATE TABLE IF NOT EXISTS Movimientos_Inventario (id INTEGER PRIMARY KEY, producto_id INTEGER, tipo TEXT, cantidad INTEGER, stock_anterior INTEGER, stock_nuevo INTEGER, motivo TEXT, fecha TEXT)");

// Insertar usuarios iniciales si no existen
db.get("SELECT COUNT(*) as count FROM Usuarios", function(err, row) {
  if (row.count === 0) {
    db.run("INSERT INTO Usuarios (id, nombre, email, password, pin, rol) VALUES (1, 'Administrador', 'admin@ferrecontrol.com', 'admin123', '1234', 'admin')");
    db.run("INSERT INTO Usuarios (id, nombre, email, password, pin, rol) VALUES (2, 'Jefe/Gerente', 'gerente@ferrecontrol.com', 'gerente123', '2345', 'gerente')");
    db.run("INSERT INTO Usuarios (id, nombre, email, password, pin, rol) VALUES (3, 'Vendedor', 'vendedor@ferrecontrol.com', 'vendedor123', '3456', 'vendedor')");
  }
});

// LOGIN
app.post('/api/login', function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var pin = req.body.pin;
  
  var query = "";
  var params = [];
  
  if (pin) {
    query = "SELECT * FROM Usuarios WHERE pin = ?";
    params = [pin];
  } else if (email && password) {
    query = "SELECT * FROM Usuarios WHERE email = ? AND password = ?";
    params = [email, password];
  }
  
  db.get(query, params, function(err, usuario) {
    if (err || !usuario) {
      return res.status(401).json({"error": "Credenciales incorrectas"});
    }
    res.json({
      "message": "Login exitoso",
      "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "rol": usuario.rol}
    });
  });
});

// USUARIOS CRUD
app.get('/api/usuarios', function(req, res) {
  db.all("SELECT id, nombre, email, pin, rol FROM Usuarios", function(err, rows) {
    if (err) return res.status(500).json({"error": err.message});
    res.json(rows);
  });
});

app.post('/api/usuarios', function(req, res) {
  var nombre = req.body.nombre;
  var email = req.body.email;
  var password = req.body.password;
  var pin = req.body.pin;
  var rol = req.body.rol || 'vendedor';
  
  db.run("INSERT INTO Usuarios (nombre, email, password, pin, rol) VALUES (?, ?, ?, ?, ?)",
    [nombre, email, password, pin, rol], function(err) {
    if (err) return res.status(400).json({"error": err.message});
    res.json({"id": this.lastID, "message": "Usuario creado"});
  });
});

// PRODUCTOS CRUD
app.get('/api/productos', function(req, res) {
  db.all("SELECT * FROM Productos", function(err, rows) {
    if (err) return res.status(500).json({"error": err.message});
    res.json(rows);
  });
});

app.post('/api/productos', function(req, res) {
  var codigo = req.body.codigo || 'PROD' + Date.now();
  var nombre = req.body.nombre;
  var descripcion = req.body.descripcion || '';
  var precio_compra = parseFloat(req.body.precio_compra) || 0;
  var precio_venta = parseFloat(req.body.precio_venta);
  var stock = parseInt(req.body.stock) || 0;
  var stock_minimo = parseInt(req.body.stock_minimo) || 5;
  var categoria = req.body.categoria || '';
  
  db.run("INSERT INTO Productos (codigo, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [codigo, nombre, descripcion, precio_compra, precio_venta, stock, stock_minimo, categoria], function(err) {
    if (err) return res.status(500).json({"error": err.message});
    res.json({"id": this.lastID, "message": "Producto creado"});
  });
});

// VENTAS
app.post('/api/ventas', function(req, res) {
  var productos = req.body.productos;
  var metodo_pago = req.body.metodo_pago;
  var total = 0;
  
  for (var i = 0; i < productos.length; i++) {
    total += productos[i].cantidad * productos[i].precio_unitario;
  }
  
  db.run("INSERT INTO Ventas (fecha, total, metodo_pago, estado) VALUES (?, ?, ?, ?)",
    [new Date().toISOString(), total, metodo_pago, 'completada'], function(err) {
    if (err) return res.status(500).json({"error": err.message});
    var venta_id = this.lastID;
    
    for (var j = 0; j < productos.length; j++) {
      db.run("INSERT INTO Detalle_Venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
        [venta_id, productos[j].producto_id, productos[j].cantidad, productos[j].precio_unitario, productos[j].cantidad * productos[j].precio_unitario]);
    }
    
    res.json({"id": venta_id, "message": "Venta completada", "total": total});
  });
});

// DASHBOARD
app.get('/api/dashboard', function(req, res) {
  var hoy = new Date().toISOString().split('T')[0];
  var result = {};
  
  db.get("SELECT COUNT(*) as total FROM Productos", function(err, row) {
    result.productos = {"total": row.total};
    
    db.all("SELECT * FROM Ventas WHERE fecha LIKE ?", [hoy + '%'], function(err, ventas) {
      result.ventas_hoy = {"ventas": ventas.length, "ingresos": ventas.reduce(function(sum, v) { return sum + v.total; }, 0)};
      res.json(result);
    });
  });
});

app.listen(PORT, function() {
  console.log('Servidor SQLite en puerto ' + PORT);
});
