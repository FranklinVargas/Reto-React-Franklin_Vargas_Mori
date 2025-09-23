import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { buildStatusPayload, normalizeOrder } from "../utils/apiTransforms";
import ConfirmDialog from "../components/ConfirmDialog";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [target, setTarget] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const summary = useMemo(() => {
    const revenue = orders.reduce((total, order) => total + Number(order.finalPrice || 0), 0);
    const pending = orders.filter((order) => order.status === "Pending").length;
    const inProgress = orders.filter((order) => order.status === "InProgress").length;
    const completed = orders.filter((order) => order.status === "Completed").length;
    return {
      total: orders.length,
      revenue,
      pending,
      inProgress,
      completed,
    };
  }, [orders]);

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };

  const fetchOrders = async () => {
    const res = await api.get("/orders");
    const list = Array.isArray(res.data) ? res.data : [];
    setOrders(list.map(normalizeOrder));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      await api.patch(`/orders/${id}/status`, buildStatusPayload(status));
      fetchOrders();
    } catch (e) {
      alert(e.response?.data?.message || "Error changing status");
    }
  };

  const cards = [
    {
      label: "Pedidos totales",
      value: summary.total,
      accent: "from-sky-500/20 to-indigo-500/20",
    },
    {
      label: "Ingresos acumulados",
      value: `S/. ${summary.revenue.toFixed(2)}`,
      accent: "from-emerald-400/20 to-teal-400/20",
    },
    {
      label: "Pendientes",
      value: summary.pending,
      accent: "from-amber-400/20 to-orange-400/20",
    },
    {
      label: "En progreso",
      value: summary.inProgress,
      accent: "from-cyan-400/20 to-blue-500/20",
    },
    {
      label: "Completadas",
      value: summary.completed,
      accent: "from-purple-500/20 to-fuchsia-500/20",
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-sky-900/30 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-200/70">
              Panel de pedidos
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">Gestiona tus órdenes</h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-200/80">
              Visualiza el estado de cada pedido, ajusta su progreso en tiempo real y mantén un control total sobre tus ventas.
            </p>
          </div>
          <Link
            to="/add-order"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:scale-[1.03]"
          >
            + Nueva orden
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <article
            key={card.label}
            className={`rounded-3xl border border-white/10 bg-slate-900/70 bg-gradient-to-br ${card.accent} p-6 shadow-lg shadow-slate-950/40 backdrop-blur`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/80">
              {card.label}
            </p>
            <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/40 backdrop-blur">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead className="bg-white/5 text-left text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-slate-300/80">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Orden</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Productos</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {orders.map((o, idx) => (
              <tr key={o.id} className={idx % 2 === 0 ? "bg-white/5" : "bg-transparent"}>
                <td className="px-6 py-4 align-middle text-slate-300/90">{o.id}</td>
                <td className="px-6 py-4 align-middle font-semibold text-white">{o.orderNumber}</td>
                <td className="px-6 py-4 align-middle text-slate-200/80">{formatDate(o.date)}</td>
                <td className="px-6 py-4 align-middle">{o.productsCount}</td>
                <td className="px-6 py-4 align-middle text-emerald-300 font-semibold">S/. {o.finalPrice.toFixed(2)}</td>
                <td className="px-6 py-4 align-middle">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatus(o.id, e.target.value)}
                    className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-100 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                  >
                    <option>Pending</option>
                    <option>InProgress</option>
                    <option>Completed</option>
                  </select>
                </td>
                <td className="px-6 py-4 align-middle">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/add-order/${o.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-sky-500/20"
                    >
                      ✏️ Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => askDelete(o)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-500/20"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td className="px-6 py-12 text-center text-slate-400" colSpan="7">
                  Aún no has registrado pedidos. Crea el primero para comenzar a medir tu impacto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar pedido"
        message={`¿Seguro que deseas eliminar la orden "${target?.orderNumber}"?`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doDelete}
      />
    </div>
  );
}
