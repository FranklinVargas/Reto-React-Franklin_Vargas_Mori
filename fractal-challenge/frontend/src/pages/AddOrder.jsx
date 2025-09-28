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

  const totals = useMemo(() => {
    const productsCount = items.reduce((a, b) => a + Number(b.qty), 0);
    const finalPrice = items.reduce((a, b) => a + Number(b.totalPrice), 0);
    return { productsCount, finalPrice };
  }, [items]);

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

  const openAdd = () => { setEditIndex(null); setPickerOpen(true); };
  const openEdit = (idx) => { setEditIndex(idx); setPickerOpen(true); };

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

  const persist = async () => {
    if (!orderNumber.trim()) return alert("Order # is required");
    if (items.length === 0) return alert("Add at least one product");

    const payload = {
      orderNumber,
      items: items.map(it => ({ productId: it.productId, qty: it.qty }))
    };

    try {
      if (isEdit) await api.put(`/orders/${id}`, payload);
      else await api.post("/orders", payload);

      navigate("/my-orders");
    } catch (e) {
      alert(e.response?.data?.message || "Error saving order");
    }
  };

  return (
    <div className="page">
      <div className="card stack">
        <h1 className="page__title">{isEdit ? "✏️ Edit Order" : "➕ Add New Order"}</h1>

        <div className="form-grid form-grid--two">
          <div className="field">
            <label>Order Number</label>
            <input
              className="input"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Date</label>
            <input
              className="input input--muted"
              value={dateString}
              disabled
            />
          </div>
          <div className="field">
            <label># Products</label>
            <input
              className="input input--muted"
              value={totals.productsCount}
              disabled
            />
          </div>
          <div className="field">
            <label>Final Price</label>
            <input
              className="input input--muted input--strong"
              value={`S/. ${totals.finalPrice.toFixed(2)}`}
              disabled
            />
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">Products</h2>
          <button onClick={openAdd} className="btn btn--success">+ Add Item</button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Unit Price</th>
                <th>Qty</th>
                <th>Total Price</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.productId}</td>
                  <td>{it.name}</td>
                  <td>S/. {it.unitPrice}</td>
                  <td>{it.qty}</td>
                  <td className="text-success">S/. {it.totalPrice}</td>
                  <td className="actions">
                    <button onClick={() => openEdit(idx)} className="btn btn--link">✏️ Edit</button>
                    <button onClick={() => askRemove(idx)} className="btn btn--link btn--danger-link">🗑️ Remove</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="6" className="table__empty">
                    No products in this order.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex-gap-sm flex-justify-end">
          <button onClick={persist} className="btn btn--primary">
            💾 {isEdit ? "Update Order" : "Save Order"}
          </button>
        </div>
      </div>

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
