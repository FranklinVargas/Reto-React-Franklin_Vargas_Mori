import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [target, setTarget] = useState(null); // id a borrar
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchOrders = async () => {
    const res = await api.get("/orders");
    setOrders(res.data);
  };

  useEffect(() => { fetchOrders(); }, []);

  const askDelete = (order) => {
    setTarget(order);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    try {
      await api.delete(`/orders/${target.id}`);
      setConfirmOpen(false);
      setTarget(null);
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || "Error deleting");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || "Error changing status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-gray-800">📑 My Orders</h1>
        <Link
          to="/add-order"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          + New Order
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Order #</th>
              <th className="p-3">Date</th>
              <th className="p-3"># Products</th>
              <th className="p-3">Final Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Options</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, idx) => (
              <tr
                key={o.id}
                className={`border-t ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="p-3">{o.id}</td>
                <td className="p-3 font-semibold">{o.orderNumber}</td>
                <td className="p-3">{new Date(o.date).toLocaleString()}</td>
                <td className="p-3">{o.productsCount}</td>
                <td className="p-3 text-green-700 font-bold">S/. {o.finalPrice}</td>
                <td className="p-3">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatus(o.id, e.target.value)}
                    className="border rounded-lg p-2 bg-white focus:ring focus:ring-blue-300"
                  >
                    <option>Pending</option>
                    <option>InProgress</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td className="p-3 flex gap-4">
                  <Link
                    to={`/add-order/${o.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => askDelete(o)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  className="p-4 text-center text-gray-500"
                  colSpan="7"
                >
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete order"
        message={`Are you sure you want to delete order "${target?.orderNumber}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />
    </div>
  );
}
