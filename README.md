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

1. Copia `frontend/.env.example` como `frontend/.env`.
2. Ajusta `VITE_API_URL` con la URL pública de tu backend (incluye el sufijo `/api`).
3. Ejecuta `npm run build` dentro de `frontend` y sirve la carpeta `dist` generada.
