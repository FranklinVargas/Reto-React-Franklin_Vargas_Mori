import { useState, useEffect } from "react";
import api from "../api";

export default function OrderProductsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const resOrders = await api.get("/orders");
      setOrders(resOrders.data);
      const resProducts = await api.get("/products");
      setProducts(resProducts.data);
    };
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    try {
      await api.post("/order-products", { order_id: orderId, product_id: productId, qty });
      setMessage("Producto agregado correctamente");
    } catch {
      setMessage("Error al agregar producto");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">🛒 Asociar Productos a Órdenes</h1>

      <div className="flex gap-2 mb-6">
        <select
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="px-4 py-2 rounded bg-gray-800 border border-gray-600"
        >
          <option value="">Seleccionar Orden</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>{o.order_number}</option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="px-4 py-2 rounded bg-gray-800 border border-gray-600"
        >
          <option value="">Seleccionar Producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          min="1"
          className="w-20 px-2 py-2 rounded bg-gray-800 border border-gray-600 text-center"
        />

        <button
          onClick={handleAddProduct}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white"
        >
          Agregar
        </button>
      </div>

      {message && <p className="mb-4">{message}</p>}
    </div>
  );
}
