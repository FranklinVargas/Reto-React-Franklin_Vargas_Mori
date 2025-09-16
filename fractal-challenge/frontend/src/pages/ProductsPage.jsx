import { useState, useEffect, useCallback, useRef } from "react";
import api from "../api";

const formatCurrency = (value) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  return numeric.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const feedbackTimeoutRef = useRef();

  const scheduleFeedbackClear = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimeoutRef.current = undefined;
    }, 4000);
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error al cargar productos", error);
      setFeedback({
        type: "error",
        message:
          "No se pudieron cargar los productos. Verifica la conexión con el backend.",
      });
      scheduleFeedbackClear();
    } finally {
      setIsLoading(false);
    }
  }, [scheduleFeedbackClear]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(
    () => () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    },
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const parsedPrice = Number(price);

    if (!trimmedName) {
      setFeedback({ type: "error", message: "Ingresa un nombre para el producto." });
      scheduleFeedbackClear();
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFeedback({
        type: "error",
        message: "El precio debe ser un número mayor que cero.",
      });
      scheduleFeedbackClear();
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/products", { name: trimmedName, price: parsedPrice });
      setFeedback({ type: "success", message: "Producto agregado correctamente." });
      setName("");
      setPrice("");
      await loadProducts();
    } catch (error) {
      const apiMessage = error?.response?.data?.error;
      setFeedback({
        type: "error",
        message: apiMessage || "No se pudo agregar el producto. Intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
      scheduleFeedbackClear();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-green-400">
          🛒 Gestión de Productos
        </h1>

        {feedback && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-sm font-medium ${
              feedback.type === "success"
                ? "border-green-500 bg-green-500/10 text-green-200"
                : "border-red-500 bg-red-500/10 text-red-200"
            }`}
            role="status"
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 min-w-[12rem] px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="number"
              placeholder="Precio"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className="w-full sm:w-32 px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 ${
                isSubmitting
                  ? "bg-green-700/60 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isSubmitting ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>

        <h2 className="text-xl font-semibold mb-4">📋 Lista de Productos</h2>

        {isLoading ? (
          <p className="text-gray-300">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400">Aún no hay productos registrados.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p.id}
                className="p-3 bg-gray-700 rounded flex justify-between items-center"
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-gray-200">{formatCurrency(p.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
