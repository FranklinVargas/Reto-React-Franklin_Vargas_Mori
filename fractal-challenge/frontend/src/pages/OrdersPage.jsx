import { useState, useEffect } from "react";
import api from "../api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await api.get("/orders");
      setOrders(res.data);
    };
    fetchOrders();
  }, []);

  const addOrder = async () => {
    if (!orderNumber) return;
    await api.post("/orders", { order_number: orderNumber, status });
    setOrderNumber("");
    const res = await api.get("/orders");
    setOrders(res.data);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-blue-400">
          📑 Gestión de Órdenes
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Número de orden"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="flex-1 px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            onClick={addOrder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold"
          >
            Crear
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">📋 Lista de Órdenes</h2>
        <ul className="space-y-2">
          {orders.map((o) => (
            <li
              key={o.id}
              className="p-3 bg-gray-700 rounded flex justify-between items-center"
            >
              <span>{o.order_number} - {o.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
