# Reto Técnico – Gestión de Productos y Órdenes  
Link: https://reto-react-franklin-varg-git-fb8323-franklins-projects-4f552875.vercel.app?_vercel_share=esv6CSlprURBEQ3ZRjcXDQD7mHIucn8f

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

## Backend alternativo en Python (FastAPI)

El proyecto incluye un backend de referencia en `python.py` pensado para
entornos Docker con MySQL. Puedes ejecutarlo con:

```bash
pip install fastapi uvicorn sqlalchemy pymysql
uvicorn python:app --reload --host 0.0.0.0 --port 4000
```

Variables de entorno relevantes:

| Variable         | Descripción                                                                 | Valor por defecto               |
|------------------|------------------------------------------------------------------------------|---------------------------------|
| `DATABASE_URL`   | Cadena completa de conexión (tiene prioridad sobre el resto).               | —                               |
| `MYSQL_HOST`     | Host del servidor MySQL. Detecta automáticamente el contenedor `mi-mysql-db` | `mi-mysql-db` o `localhost`     |
| `MYSQL_PORT`     | Puerto del servidor MySQL.                                                  | `3306`                          |
| `MYSQL_USER`     | Usuario con permisos de lectura/escritura.                                  | `root`                          |
| `MYSQL_PASSWORD` | Contraseña del usuario.                                                     | `mi-clave-secreta`              |
| `MYSQL_DATABASE` | Base de datos que se utilizará (se crea automáticamente si no existe).      | `reto_db`                       |

> 💡 Si estás corriendo MySQL en Docker, asegúrate de usar el comando
> `docker run --name mi-mysql-db -e MYSQL_ROOT_PASSWORD=mi-clave-secreta ...`
> para que el backend pueda conectarse sin configuración adicional.

## Variables de entorno para despliegue

1. Copia `frontend/.env.example` como `frontend/.env`.
2. Ajusta `VITE_API_URL` con la URL pública de tu backend (incluye el sufijo `/api`).
3. Ejecuta `npm run build` dentro de `frontend` y sirve la carpeta `dist` generada.
