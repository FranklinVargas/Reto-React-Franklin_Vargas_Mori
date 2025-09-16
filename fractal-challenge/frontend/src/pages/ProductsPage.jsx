import { useState, useEffect } from "react";
import api from "../api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await api.get("/products");
      setProducts(res.data);
    };
    fetchProducts();
  }, []);

  const addProduct = async () => {
    if (!name || !price) return;
    await api.post("/products", { name, price });
    setName("");
    setPrice("");
    const res = await api.get("/products");
    setProducts(res.data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-green-400">
          🛒 Gestión de Productos
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-28 px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={addProduct}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold"
          >
            Agregar
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">📋 Lista de Productos</h2>
        <ul className="space-y-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="p-3 bg-gray-700 rounded flex justify-between items-center"
            >
              <span>{p.name} - ${p.price}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
