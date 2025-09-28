import { useEffect, useState } from "react";
import Modal from "./Modal";

export default function ProductPickerModal({
  open,
  products = [],
  initial = { productId: undefined, qty: 1 },
  onClose,
  onSave
}) {
  const [productId, setProductId] = useState(initial.productId ?? products[0]?.id);
  const [qty, setQty] = useState(initial.qty ?? 1);

  useEffect(() => {
    setProductId(initial.productId ?? products[0]?.id);
    setQty(initial.qty ?? 1);
  }, [initial, products, open]);

  const handleSave = () => {
    const p = products.find(x => x.id === Number(productId));
    if (!p) return;
    onSave({
      productId: p.id,
      name: p.name,
      unitPrice: Number(p.unitPrice),
      qty: Number(qty),
      totalPrice: Number(p.unitPrice) * Number(qty),
    });
  };

  return (
    <Modal open={open} title="Add / Edit product" onClose={onClose}>
      <div className="stack stack--sm">
        <div className="field">
          <label>Product</label>
          <select
            className="select"
            value={productId ?? ""}
            onChange={e => setProductId(Number(e.target.value))}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} — S/. {p.unitPrice}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Qty</label>
          <input
            type="number"
            min="1"
            className="input"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
          />
        </div>
        <div className="modal__actions">
          <button onClick={onClose} className="btn btn--ghost">Cancel</button>
          <button onClick={handleSave} className="btn btn--primary">Save</button>
        </div>
      </div>
    </Modal>
  );
}
