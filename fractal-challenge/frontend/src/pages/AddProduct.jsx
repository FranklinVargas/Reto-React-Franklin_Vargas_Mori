import { useState } from "react";
import api from "../services/api";
import { serializeProductInput } from "../utils/apiTransforms";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const navigate = useNavigate();

  const saveProduct = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !unitPrice) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      const payload = serializeProductInput({
        name: trimmedName,
        unitPrice: parseFloat(unitPrice),
      });

      await api.post("/products", payload);
      alert("✅ Producto agregado con éxito");
      navigate("/my-orders"); // redirige a tus órdenes
    } catch (e) {
      alert(e.response?.data?.message || "Error al guardar");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          ➕ Agregar Producto
        </h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre del producto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej: Laptop 14''"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Precio unitario (S/.)
            </label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ej: 2500"
            />
          </div>

          <button
            onClick={saveProduct}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            💾 Guardar Producto
          </button>
        </div>
      </div>
    </div>
  );
}
