import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";

const fieldClasses =
  "w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-100 shadow-inner shadow-slate-900/40 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-400/60";

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

  const selectedProduct = useMemo(
    () => products.find((x) => x.id === Number(productId)),
    [productId, products]
  );

  const totalPreview = useMemo(() => {
    const unit = Number(selectedProduct?.unitPrice ?? 0);
    const quantity = Number(qty || 0);
    if (!Number.isFinite(unit) || !Number.isFinite(quantity)) return 0;
    return unit * quantity;
  }, [selectedProduct, qty]);

  const handleSave = () => {
    const p = selectedProduct;
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
    <Modal open={open} title="Seleccionar producto" onClose={onClose}>
      <div className="space-y-6 text-sm text-slate-200">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Producto
          </label>
          <select
            className={fieldClasses}
            value={productId ?? ""}
            onChange={(e) => setProductId(Number(e.target.value))}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — S/. {Number(p.unitPrice).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            className={fieldClasses}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-200">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">Resumen</p>
          <p className="mt-1 text-lg font-semibold">
            Total estimado: <span className="text-white">S/. {totalPreview.toFixed(2)}</span>
          </p>
          {selectedProduct && (
            <p className="mt-1 text-xs text-emerald-100/80">
              {selectedProduct.name} · Precio unitario S/. {Number(selectedProduct.unitPrice).toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg shadow-sky-500/40 transition hover:scale-[1.02]"
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}
