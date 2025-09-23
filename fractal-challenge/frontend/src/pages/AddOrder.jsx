import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import {
  normalizeOrder,
  normalizeProduct,
  serializeOrderPayload,
} from "../utils/apiTransforms";
import ProductPickerModal from "../components/ProductPickerModal";
import ConfirmDialog from "../components/ConfirmDialog";

const inputClasses =
  "w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-100 placeholder-slate-400 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-400/60";

export default function AddOrder() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [orderNumber, setOrderNumber] = useState("");
  const [dateString, setDateString] = useState(() => new Date().toLocaleString());
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Pending");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(null);

  const totals = useMemo(() => {
    const productsCount = items.reduce((a, b) => a + Number(b.qty), 0);
    const finalPrice = items.reduce((a, b) => a + Number(b.totalPrice), 0);
    return { productsCount, finalPrice };
  }, [items]);

  useEffect(() => {
    api.get("/products").then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list.map(normalizeProduct));
    });

    if (isEdit) {
      api.get(`/orders/${id}`).then((res) => {
        const normalized = normalizeOrder(res.data ?? {});
        setOrderNumber(normalized.orderNumber ?? "");
        setStatus(normalized.status ?? "Pending");
        setDateString(
          normalized.date ? new Date(normalized.date).toLocaleString() : new Date().toLocaleString()
        );
        setItems(
          normalized.items.map((it) => ({
            productId: it.productId,
            name: it.name,
            unitPrice: it.unitPrice,
            qty: it.qty,
            totalPrice: it.totalPrice,
          }))
        );
      });
    }
  }, [id, isEdit]);

  const openAdd = () => {
    setEditIndex(null);
    setPickerOpen(true);
  };

  const openEdit = (idx) => {
    setEditIndex(idx);
    setPickerOpen(true);
  };

  const saveFromPicker = (row) => {
    if (!row || !row.productId) return;

    if (editIndex === null) {
      const exists = items.findIndex((it) => it.productId === row.productId);
      if (exists !== -1) {
        const copy = [...items];
        copy[exists].qty += row.qty;
        copy[exists].totalPrice = copy[exists].qty * copy[exists].unitPrice;
        setItems(copy);
      } else {
        setItems((prev) => [...prev, row]);
      }
    } else {
      const copy = [...items];
      copy[editIndex] = row;
      setItems(copy);
    }
    setPickerOpen(false);
  };

  const askRemove = (idx) => {
    setRemoveIndex(idx);
    setConfirmOpen(true);
  };

  const doRemove = () => {
    setItems(items.filter((_, i) => i !== removeIndex));
    setConfirmOpen(false);
  };

  const persist = async () => {
    const trimmedOrderNumber = orderNumber.trim();
    if (!trimmedOrderNumber) {
      alert("El número de orden es obligatorio");
      return;
    }
    if (items.length === 0) {
      alert("Agrega al menos un producto");
      return;
    }

    const payload = serializeOrderPayload({
      orderNumber: trimmedOrderNumber,
      items,
      status,
    });

    try {
      if (isEdit) await api.put(`/orders/${id}`, payload);
      else await api.post("/orders", payload);

      navigate("/my-orders");
    } catch (e) {
      const errorPayload = e.response?.data;
      console.error("❌ Error guardando orden:", errorPayload || e.message);
      const errorMessage =
        errorPayload?.detail ??
        errorPayload?.message ??
        errorPayload?.error ??
        e.message;
      alert(errorMessage || "Error al guardar la orden");
    }
  };

  const heroTitle = isEdit ? "Editar orden" : "Nueva orden";
  const heroSubtitle = isEdit
    ? "Actualiza los productos y el estado para mantener informados a tus clientes."
    : "Diseña una orden inolvidable seleccionando productos, cantidades y estado inicial.";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-sky-900/30 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-200/70">
              Constructor de órdenes
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">{heroTitle}</h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-200/80">{heroSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={persist}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/40 transition hover:scale-[1.03]"
          >
            💾 {isEdit ? "Actualizar orden" : "Guardar orden"}
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Detalles principales</h2>
          <p className="mt-2 text-sm text-slate-200/80">
            Personaliza los datos base que identifican la orden y configuran su estado inicial.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Número de orden
              </label>
              <input
                className={inputClasses}
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ej: ORD-4587"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Fecha de creación
              </label>
              <input className={inputClasses} value={dateString} disabled readOnly />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Estado
              </label>
              <select
                className={inputClasses}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="InProgress">InProgress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Identificador interno
              </label>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200/80">
                {isEdit ? `ID ${id}` : "Se generará automáticamente"}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-5 text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">
                Productos incluidos
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">{totals.productsCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-5 text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200/70">
                Total estimado
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">S/. {totals.finalPrice.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Productos de la orden</h2>
            <p className="text-sm text-slate-200/80">
              Selecciona artículos desde tu inventario y personaliza las cantidades.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:scale-[1.03]"
          >
            + Añadir producto
          </button>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="min-w-full divide-y divide-white/5 text-sm">
            <thead className="bg-white/5 text-left text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-slate-300/80">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Precio unitario</th>
                <th className="px-6 py-4">Cantidad</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {items.map((it, idx) => (
                <tr key={`${it.productId}-${idx}`} className={idx % 2 === 0 ? "bg-white/5" : "bg-transparent"}>
                  <td className="px-6 py-4 text-slate-300/80">{it.productId}</td>
                  <td className="px-6 py-4 font-semibold text-white">{it.name}</td>
                  <td className="px-6 py-4 text-emerald-300 font-semibold">S/. {it.unitPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">{it.qty}</td>
                  <td className="px-6 py-4 text-emerald-200 font-semibold">S/. {it.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(idx)}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-200 transition hover:bg-sky-500/20"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => askRemove(idx)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-500/20"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan="6">
                    Aún no se han agregado productos a esta orden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ProductPickerModal
        open={pickerOpen}
        products={products}
        initial={editIndex !== null ? items[editIndex] : undefined}
        onClose={() => setPickerOpen(false)}
        onSave={saveFromPicker}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar producto"
        message="¿Seguro que deseas quitar este producto de la orden?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doRemove}
      />
    </div>
  );
}
