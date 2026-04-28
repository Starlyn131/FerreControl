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
    return { 
      "Productos": [], 
      "Ventas": [], 
      "Detalle_Venta": [], 
      "Movimientos_Inventario": [], 
      "Usuarios": [], 
      "nextIds": { "productos": 1, "ventas": 1, "detalle": 1, "movimientos": 1, "usuarios": 4 } 
    };
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch(e) {
    return { 
      "Productos": [], 
      "Ventas": [], 
      "Detalle_Venta": [], 
      "Movimientos_Inventario": [], 
      "Usuarios": [], 
      "nextIds": { "productos": 1, "ventas": 1, "detalle": 1, "movimientos": 1, "usuarios": 4 } 
    };
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch(e) {
    console.error('Error guardando:', e.message);
  }
}

function ensureUsers() {
  var data = readData();
  
  if (!data.Usuarios) {
    data.Usuarios = [];
  }
  
  var defaultUsers = [
    { "id": 1, "nombre": "Administrador", "email": "admin@ferrecontrol.com", "password": "admin123", "pin": "1234", "rol": "admin" },
    { "id": 2, "nombre": "Jefe/Gerente", "email": "gerente@ferrecontrol.com", "password": "gerente123", "pin": "2345", "rol": "gerente" },
    { "id": 3, "nombre": "Vendedor", "email": "vendedor@ferrecontrol.com", "password": "vendedor123", "pin": "3456", "rol": "vendedor" }
  ];
  
  var modified = false;
  
  for (var i = 0; i < defaultUsers.length; i++) {
    var found = false;
    for (var j = 0; j < data.Usuarios.length; j++) {
      if (data.Usuarios[j].email === defaultUsers[i].email) {
        found = true;
        break;
      }
    }
    if (!found) {
      data.Usuarios.push(defaultUsers[i]);
      modified = true;
      console.log('Usuario agregado: ' + defaultUsers[i].email);
    }
  }
  
  if (modified) {
    saveData(data);
    console.log('Total usuarios: ' + data.Usuarios.length);
  }
}

ensureUsers();

app.post('/api/login', function(req, res) {
  var data = readData();
  var usuario = null;
  
  if (req.body.pin) {
    for (var i = 0; i < data.Usuarios.length; i++) {
      if (data.Usuarios[i].pin === req.body.pin) {
        usuario = data.Usuarios[i];
        break;
      }
    }
  } else if (req.body.email && req.body.password) {
    for (var j = 0; j < data.Usuarios.length; j++) {
      if (data.Usuarios[j].email === req.body.email && data.Usuarios[j].password === req.body.password) {
        usuario = data.Usuarios[j];
        break;
      }
    }
  }
  
  if (!usuario) {
    return res.status(401).json({ "error": "Credenciales incorrectas" });
  }
  
  res.json({
    "message": "Login exitoso",
    "usuario": { "id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "rol": usuario.rol }
  });
});

app.listen(PORT, function() {
  console.log('Servidor en puerto ' + PORT);
});
