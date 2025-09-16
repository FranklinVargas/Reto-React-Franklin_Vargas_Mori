// src/api.js
import axios from "axios";

// 🔹 Permite definir la URL del backend mediante variables de entorno en build
const envBaseUrl = import.meta.env.VITE_API_URL?.trim();

// 🔹 Fallbacks:
//    - entorno local: usa el backend en localhost:4000
//    - producción sin variable: asume mismo dominio del frontend (ruta /api)
const defaultBaseUrl =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:4000/api"
    : "/api";

const api = axios.create({
  baseURL: envBaseUrl || defaultBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
