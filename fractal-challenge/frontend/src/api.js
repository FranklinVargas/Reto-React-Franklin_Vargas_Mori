// src/api.js
import axios from "axios";

// 🔹 Permite definir la URL del backend mediante variables de entorno en build
//    - Reutiliza el nombre actual (VITE_API_URL) y los alias previos (p. ej. VITE_BACKEND_URL)
//    - También acepta variables genéricas como PUBLIC_API_URL o API_URL que algunos hosts exponen automáticamente
const envBaseUrl = [
  import.meta.env.VITE_API_URL,
  import.meta.env.VITE_BACKEND_URL,
  import.meta.env.PUBLIC_API_URL,
  import.meta.env.API_URL,
]
  .map((value) => value?.trim())
  .find(Boolean);

// 🔹 Fallbacks:
//    - entorno local: usa el backend en localhost:4000
//    - producción sin variable: asume mismo dominio del frontend (ruta /api)
const isLocalhost =
  typeof window !== "undefined" && window.location.hostname === "localhost";

const defaultBaseUrl = isLocalhost ? "http://localhost:4000/api" : "/api";

const api = axios.create({
  baseURL: envBaseUrl || defaultBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
