// src/api.js
import axios from "axios";

// 🔹 Crear instancia de axios con la URL base de tu backend
const api = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
