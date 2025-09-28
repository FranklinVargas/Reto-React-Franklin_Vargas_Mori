import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [target, setTarget] = useState(null);
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
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">📑 My Orders</h1>
        <Link to="/add-order" className="btn btn--success">+ New Order</Link>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Order #</th>
              <th>Date</th>
              <th># Products</th>
              <th>Final Price</th>
              <th>Status</th>
              <th>Options</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td className="text-strong">{o.orderNumber}</td>
                <td>{new Date(o.date).toLocaleString()}</td>
                <td>{o.productsCount}</td>
                <td className="text-success">S/. {o.finalPrice}</td>
                <td>
                  <select
                    value={o.status}
                    onChange={(e) => handleStatus(o.id, e.target.value)}
                    className="select"
                  >
                    <option>Pending</option>
                    <option>InProgress</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td className="actions">
                  <Link to={`/add-order/${o.id}`} className="btn btn--link">
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => askDelete(o)}
                    className="btn btn--link btn--danger-link"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className="table__empty" colSpan="7">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
