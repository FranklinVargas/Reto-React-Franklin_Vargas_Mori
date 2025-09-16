import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import ProductPickerModal from "../components/ProductPickerModal";
import ConfirmDialog from "../components/ConfirmDialog";

export default function AddOrder() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [orderNumber, setOrderNumber] = useState("");
  const [dateString, setDateString] = useState(() => new Date().toLocaleString());
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeIndex, setRemoveIndex] = useState(null);

  // Totales
  const totals = useMemo(() => {
    const productsCount = items.reduce((a, b) => a + Number(b.qty), 0);
    const finalPrice = items.reduce((a, b) => a + Number(b.totalPrice), 0);
    return { productsCount, finalPrice };
  }, [items]);

  // Cargar productos y orden (si es edición)
  useEffect(() => {
    api.get("/products").then(res => setProducts(res.data));

    if (isEdit) {
      api.get(`/orders/${id}`).then(res => {
        const o = res.data;
        setOrderNumber(o.orderNumber);
        setDateString(new Date(o.date).toLocaleString());
        setItems(
          (o.OrderItems ?? []).map(it => ({
            productId: it.productId,
            name: it.Product?.name,
            unitPrice: Number(it.unitPrice ?? it.Product?.unitPrice),
            qty: it.qty,
            totalPrice: Number(
              it.totalPrice ??
              (Number(it.qty) * Number(it.unitPrice ?? it.Product?.unitPrice))
            ),
          }))
        );
      });
    }
  }, [id, isEdit]);

  // Abrir modal para agregar
  const openAdd = () => { setEditIndex(null); setPickerOpen(true); };
  const openEdit = (idx) => { setEditIndex(idx); setPickerOpen(true); };

  // Guardar producto del modal
  const saveFromPicker = (row) => {
    if (!row || !row.productId) return;

    if (editIndex === null) {
      const exists = items.findIndex(it => it.productId === row.productId);
      if (exists !== -1) {
        const copy = [...items];
        copy[exists].qty += row.qty;
        copy[exists].totalPrice = copy[exists].qty * copy[exists].unitPrice;
        setItems(copy);
      } else {
        setItems(prev => [...prev, row]);
      }
    } else {
      const copy = [...items];
      copy[editIndex] = row;
      setItems(copy);
    }
    setPickerOpen(false);
  };

  const askRemove = (idx) => { setRemoveIndex(idx); setConfirmOpen(true); };
  const doRemove = () => {
    setItems(items.filter((_, i) => i !== removeIndex));
    setConfirmOpen(false);
  };

  // Guardar orden en backend
  const persist = async () => {
    if (!orderNumber.trim()) return alert("Order # is required");
    if (items.length === 0) return alert("Add at least one product");

    const payload = {
      orderNumber,
      items: items.map(it => ({ productId: it.productId, qty: it.qty }))
    };

    console.log("👉 Enviando payload:", payload);

    try {
      if (isEdit) await api.put(`/orders/${id}`, payload);
      else await api.post("/orders", payload);

      navigate("/my-orders");
    } catch (e) {
      console.error("❌ Error guardando:", e.response?.data || e.message);
      alert(e.response?.data?.message || "Error saving order");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <h1 className="text-3xl font-extrabold text-gray-800">
        {isEdit ? "✏️ Edit Order" : "➕ Add New Order"}
      </h1>

      {/* Datos de la orden */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-600 text-sm mb-1">Order Number</label>
          <input
            className="border rounded-lg w-full p-3 focus:ring focus:ring-blue-300"
            value={orderNumber}
            onChange={e => setOrderNumber(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">Date</label>
          <input
            className="border rounded-lg w-full p-3 bg-gray-100"
            value={dateString}
            disabled
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1"># Products</label>
          <input
            className="border rounded-lg w-full p-3 bg-gray-100"
            value={totals.productsCount}
            disabled
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">Final Price</label>
          <input
            className="border rounded-lg w-full p-3 bg-gray-100 font-bold text-green-700"
            value={`S/. ${totals.finalPrice.toFixed(2)}`}
            disabled
          />
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700">Products</h2>
        <button
          onClick={openAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Item
        </button>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Unit Price</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Total Price</th>
              <th className="p-2">Options</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-2">{it.productId}</td>
                <td className="p-2">{it.name}</td>
                <td className="p-2">S/. {it.unitPrice}</td>
                <td className="p-2">{it.qty}</td>
                <td className="p-2 text-green-700 font-bold">S/. {it.totalPrice}</td>
                <td className="p-2 flex gap-3">
                  <button onClick={() => openEdit(idx)} className="text-blue-600 hover:underline">✏️ Edit</button>
                  <button onClick={() => askRemove(idx)} className="text-red-600 hover:underline">🗑️ Remove</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No products in this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={persist}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow"
        >
          💾 {isEdit ? "Update Order" : "Save Order"}
        </button>
      </div>

      {/* Modales */}
      <ProductPickerModal
        open={pickerOpen}
        products={products}
        initial={editIndex !== null ? items[editIndex] : undefined}
        onClose={() => setPickerOpen(false)}
        onSave={saveFromPicker}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Remove product"
        message="Are you sure you want to remove this product from the order?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={doRemove}
      />
    </div>
  );
}
