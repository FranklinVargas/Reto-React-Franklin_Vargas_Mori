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
      <div className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Product</label>
          <select
            className="border rounded w-full p-2"
            value={productId ?? ""}
            onChange={e => setProductId(Number(e.target.value))}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} — S/. {p.unitPrice}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Qty</label>
          <input
            type="number"
            min="1"
            className="border rounded w-full p-2"
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button onClick={handleSave} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
        </div>
      </div>
    </Modal>
  );
}
