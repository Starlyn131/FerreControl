# FerreControl - Sistema de POS e Inventario

## Despliegue

### Backend (Render.com)
1. Sube el código a GitHub
2. En Render.com: "New +" → "Web Service"
3. Conecta tu repositorio de GitHub
4. Configuración:
   - Name: ferrecontrol-backend
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server.js
5. En "Environment Variables" agrega:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
6. Click "Create Web Service"
7. Copia la URL generada (ej: https://ferrecontrol-backend.onrender.com)

### Frontend (Vercel.com)
1. En Vercel.com: "New Project"
2. Importa tu repositorio de GitHub
3. Configuración:
   - Framework Preset: Vite
   - Root Directory: `ferrecontrol-frontend`
4. En "Environment Variables" agrega:
   - `VITE_API_URL` = `https://ferrecontrol-backend.onrender.com`
5. Click "Deploy"
6. Copia la URL generada (ej: https://ferrecontrol.vercel.app)

### Actualizar API URL
En el archivo `ferrecontrol-frontend/vite.config.js`, cambia:
```javascript
target: 'https://ferrecontrol-backend.onrender.com'
```

Luego sube los cambios a GitHub.

## Usuarios Predeterminados
| Rol | Email | Contraseña | PIN |
|------|-------|------------|------|
| Administrador | admin@ferrecontrol.com | admin123 | 1234 |
| Jefe/Gerente | gerente@ferrecontrol.com | gerente123 | 2345 |
| Vendedor | vendedor@ferrecontrol.com | vendedor123 | 3456 |

## Funcionalidades
- ✅ Login con Email/Contraseña o PIN
- ✅ Gestión de Usuarios (Admin)
- ✅ Inventario con Importar/Exportar Excel
- ✅ POS - Ventas con métodos de pago
- ✅ Reportes diarios y mensuales
- ✅ Dashboard con resumen
- ✅ Soporte por WhatsApp
