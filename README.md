# Reto Técnico – Gestión de Productos y Órdenes  

Aplicación Fullstack para gestionar productos y órdenes, con un backend en Node.js/Express y un frontend en React.  

## Tecnologías principales
- **Frontend**: React + Vite + Axios + React Router + TailwindCSS  
- **Backend**: Node.js + Express  
- **Base de datos**: MySQL  
- **Bonus Track**: Backend alternativo en Python (FastAPI)  

## Funcionalidades
- Crear y listar productos.  
- Crear y listar órdenes.  
- Asociar productos a órdenes con cantidades.  

## Instalación rápida

```bash
# Backend
cd backend
npm install
npm run dev   # Servidor en http://localhost:4000/api

# Frontend
cd frontend
npm install
npm run dev   # App en http://localhost:5173
```

## Variables de entorno para despliegue

### Frontend

1. Copia `frontend/.env.example` como `frontend/.env`.
2. Ajusta `VITE_API_URL` con la URL pública de tu backend (incluye el sufijo `/api`). Si ya tienes configuradas variables como `VITE_BACKEND_URL`, `PUBLIC_API_URL` o `API_URL` en tu plataforma de despliegue, el build también las tomará como alias.
3. Ejecuta `npm run build` dentro de `frontend` y sirve la carpeta `dist` generada.

### Backend

1. Copia `backend/.env.example` como `backend/.env`.
2. Si tu base de datos está en la nube, reemplaza las variables (`DB_HOST`, `DB_PORT`, `DB_USER`/`DB_USERNAME`, `DB_PASS`/`DB_PASSWORD`, `DB_NAME`/`DB_DATABASE`) con las credenciales provistas.
3. Alternativamente puedes pegar la cadena completa que entregan servicios como PlanetScale, Railway o Clever Cloud en `DB_URL` (`mysql://usuario:clave@host:puerto/base`). También se aceptan `DATABASE_URL` y `CLEARDB_DATABASE_URL`.
4. Si tu proveedor requiere TLS, activa `DB_SSL=true` para que la conexión utilice SSL.
5. (Opcional) Ajusta `DB_POOL_LIMIT` si necesitas controlar la cantidad máxima de conexiones simultáneas que abrirá el backend.
6. Inicia el servidor con `npm run start` (o configura el proceso según tu plataforma de despliegue) y asegúrate de que la aplicación frontend apunte a la ruta pública del backend (`/api`).
