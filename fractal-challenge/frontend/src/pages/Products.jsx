import { useEffect, useState } from "react";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // cargar productos al inicio
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
    }
  };

  const addProduct = async () => {
    if (!name.trim() || !unitPrice) {
      alert("Completa los campos");
      return;
    }

    try {
      await api.post("/products", { name, unitPrice: Number(unitPrice) });
      setName("");
      setUnitPrice("");
      fetchProducts();
    } catch (err) {
      console.error("❌ Error creando producto:", err);
      alert(err.response?.data?.message || "Error al crear producto");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("❌ Error eliminando producto:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg">
      {/* Título */}
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">
        📦 Productos
      </h1>

      {/* Sección de agregar producto */}
      <h2 className="text-xl font-bold text-gray-700 mb-3">➕ Agregar Producto</h2>
      <div className="flex gap-4 mb-6">
        <input
          className="border rounded-lg p-2 flex-1"
          placeholder="Nombre del producto"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded-lg p-2 w-32"
          type="number"
          placeholder="Precio"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
        />
        <button
          onClick={addProduct}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Guardar
        </button>
      </div>

      {/* Tabla de productos */}
      <h2 className="text-xl font-bold text-gray-700 mb-3">📋 Lista de Productos</h2>
      <table className="w-full border">
        <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Opciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.id}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">S/. {p.unitPrice}</td>
              <td className="p-2">
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="text-red-600 hover:underline"
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center text-gray-500 p-4">
                No hay productos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
