import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  normalizeProduct,
  serializeProductInput,
} from "../utils/apiTransforms";

const inputClasses =
  "w-full rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-100 placeholder-slate-400 shadow-inner focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-400/60";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  const stats = useMemo(() => {
    if (products.length === 0) {
      return { count: 0, average: 0, highest: 0 };
    }
    const count = products.length;
    const total = products.reduce((acc, product) => acc + Number(product.unitPrice || 0), 0);
    const highest = products.reduce(
      (acc, product) => Math.max(acc, Number(product.unitPrice || 0)),
      0
    );
    return {
      count,
      average: total / count,
      highest,
    };
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list.map(normalizeProduct));
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
    }
  };

  const addProduct = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !unitPrice) {
      alert("Completa los campos");
      return;
    }

    try {
      const payload = serializeProductInput({
        name: trimmedName,
        unitPrice: Number(unitPrice),
      });

      await api.post("/products", payload);
      setName("");
      setUnitPrice("");
      fetchProducts();
    } catch (err) {
      console.error("❌ Error creando producto:", err);
      alert(err.response?.data?.message || "Error al crear producto");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("❌ Error eliminando producto:", err);
    }
  };

  const cards = [
    {
      label: "Productos registrados",
      value: stats.count,
      accent: "from-sky-500/20 to-indigo-500/20",
    },
    {
      label: "Precio promedio",
      value: `S/. ${stats.average.toFixed(2)}`,
      accent: "from-emerald-400/20 to-teal-400/20",
    },
    {
      label: "Producto más costoso",
      value: `S/. ${stats.highest.toFixed(2)}`,
      accent: "from-fuchsia-500/20 to-purple-500/20",
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <section className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-sky-900/30 backdrop-blur-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-200/70">
              Catálogo inteligente
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">Control de productos</h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-200/80">
              Mantén tu inventario siempre actualizado, identifica precios destacados y crea artículos en segundos.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
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

      <section className="grid gap-8 lg:grid-cols-[minmax(0,360px),1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 backdrop-blur">
          <h2 className="text-lg font-semibold text-white">Crear nuevo producto</h2>
          <p className="mt-2 text-sm text-slate-200/80">
            Completa el formulario y añade artículos listos para usarse en tus pedidos.
          </p>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Nombre del producto
              </label>
              <input
                className={inputClasses}
                placeholder="Ej: Laptop 14 pulgadas"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Precio unitario (S/.)
              </label>
              <input
                className={inputClasses}
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 2500"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={addProduct}
              className="w-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:scale-[1.02]"
            >
              Guardar producto
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/40 backdrop-blur">
          <div className="border-b border-white/5 bg-white/5 px-6 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-200/80">
              Lista de productos
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-sm">
              <thead className="bg-transparent text-left text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-slate-300/80">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {products.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? "bg-white/5" : "bg-transparent"}>
                    <td className="px-6 py-4 text-slate-300/80">{p.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{p.name}</td>
                    <td className="px-6 py-4 text-emerald-300 font-semibold">S/. {p.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-200 transition hover:bg-rose-500/20"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-400" colSpan="4">
                      No hay productos registrados todavía. ¡Agrega el primero y construye tu catálogo!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
