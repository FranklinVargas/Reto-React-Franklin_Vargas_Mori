import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { serializeProductInput } from "../utils/apiTransforms";

const inputClasses =
  "w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-100 placeholder-slate-400 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-400/60";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const navigate = useNavigate();

  const saveProduct = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      alert("El nombre del producto es obligatorio");
      return;
    }

    const numericPrice = Number(unitPrice);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      alert("El precio debe ser un número mayor a 0");
      return;
    }

    try {
      const payload = serializeProductInput({
        name: trimmedName,
        unitPrice: numericPrice,
      });

      await api.post("/products", payload);
      alert("✅ Producto agregado con éxito");
      navigate("/my-orders");
    } catch (e) {
      const apiMessage =
        e.response?.data?.detail ??
        e.response?.data?.message ??
        e.response?.data?.error ??
        e.message;
      alert(apiMessage || "Error al guardar");
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-sky-900/30 backdrop-blur-xl">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-200/70">
            Catálogo
          </p>
          <h1 className="text-4xl font-semibold text-white">Registrar producto</h1>
          <p className="text-sm text-slate-200/80">
            Brinda información esencial sobre tu nuevo artículo para que esté disponible al instante en los pedidos.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Nombre del producto
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClasses}
              placeholder="Ej: Laptop 14 pulgadas"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              Precio unitario (S/.)
            </label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className={inputClasses}
              placeholder="Ej: 2500"
              min="0"
              step="0.01"
            />
          </div>

          <button
            type="button"
            onClick={saveProduct}
            className="w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:scale-[1.02]"
          >
            💾 Guardar producto
          </button>
        </div>
      </section>
    </div>
  );
}
