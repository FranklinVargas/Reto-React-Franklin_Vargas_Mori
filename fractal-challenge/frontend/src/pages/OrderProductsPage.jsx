import { useEffect, useMemo, useState } from "react";
import api from "../api";

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }
  return numeric.toLocaleString("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  });
};

export default function OrderProductsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("1");
  const [orderItems, setOrderItems] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const selectedOrder = useMemo(
    () => orders.find((order) => String(order.id) === String(orderId)),
    [orders, orderId]
  );

  const loadInitialData = async () => {
    setIsLoadingOrders(true);
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        api.get("/orders"),
        api.get("/products"),
      ]);
      setOrders(ordersResponse.data);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error("No se pudieron cargar órdenes o productos", error);
      setMessage({
        type: "error",
        text: "No se pudieron cargar órdenes o productos. Revisa el backend.",
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadOrderItems = async (id) => {
    if (!id) {
      setOrderItems([]);
      return;
    }

    setIsLoadingItems(true);
    try {
      const { data } = await api.get(`/order-products/${id}`);
      setOrderItems(data);
    } catch (error) {
      console.error("No se pudieron cargar los productos de la orden", error);
      setMessage({
        type: "error",
        text: "No se pudieron cargar los productos de la orden seleccionada.",
      });
      setOrderItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadOrderItems(orderId);
  }, [orderId]);

  const handleAddProduct = async () => {
    if (!orderId) {
      setMessage({ type: "error", text: "Selecciona una orden para continuar." });
      return;
    }
    if (!productId) {
      setMessage({
        type: "error",
        text: "Selecciona un producto antes de agregarlo a la orden.",
      });
      return;
    }

    const normalizedQty = Number(qty);
    if (!Number.isInteger(normalizedQty) || normalizedQty <= 0) {
      setMessage({
        type: "error",
        text: "La cantidad debe ser un número entero mayor que cero.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/order-products", {
        order_id: Number(orderId),
        product_id: Number(productId),
        qty: normalizedQty,
      });
      setMessage({ type: "success", text: "Producto agregado a la orden." });
      setProductId("");
      setQty("1");
      await loadOrderItems(orderId);
    } catch (error) {
      console.error("Error al agregar producto a la orden", error);
      const apiMessage = error?.response?.data?.error;
      setMessage({
        type: "error",
        text: apiMessage || "No se pudo agregar el producto. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!orderId) return;
    const shouldRemove = window.confirm(
      "¿Deseas quitar este producto de la orden?"
    );
    if (!shouldRemove) return;

    try {
      await api.delete(`/order-products/${itemId}`);
      setMessage({ type: "success", text: "Producto eliminado de la orden." });
      await loadOrderItems(orderId);
    } catch (error) {
      console.error("Error al eliminar producto", error);
      setMessage({
        type: "error",
        text: "No se pudo eliminar el producto de la orden.",
      });
    }
  };

  const totals = useMemo(() => {
    if (!orderItems.length) {
      return { quantity: 0, subtotal: 0 };
    }

    return orderItems.reduce(
      (acc, item) => {
        const itemQty = Number(item.qty) || 0;
        const itemTotal = Number(item.total) || 0;
        return {
          quantity: acc.quantity + itemQty,
          subtotal: acc.subtotal + itemTotal,
        };
      },
      { quantity: 0, subtotal: 0 }
    );
  }, [orderItems]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-3xl font-bold mb-6">🛒 Asociar Productos a Órdenes</h1>

      {message && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-500 bg-green-500/10 text-green-200"
              : "border-red-500 bg-red-500/10 text-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="px-4 py-2 rounded bg-gray-800 border border-gray-600"
          disabled={isLoadingOrders}
        >
          <option value="">Seleccionar Orden</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.order_number} ({o.status})
            </option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="px-4 py-2 rounded bg-gray-800 border border-gray-600"
          disabled={!orderId || isSubmitting}
        >
          <option value="">Seleccionar Producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          min="1"
          className="w-24 px-2 py-2 rounded bg-gray-800 border border-gray-600 text-center"
          disabled={!orderId || isSubmitting}
        />

        <button
          onClick={handleAddProduct}
          className={`px-4 py-2 rounded text-white font-semibold transition ${
            isSubmitting
              ? "bg-purple-800/60 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Agregando..." : "Agregar"}
        </button>
      </div>

      {!orderId ? (
        <p className="text-gray-300">
          Selecciona una orden para ver o gestionar sus productos.
        </p>
      ) : isLoadingItems ? (
        <p className="text-gray-300">Cargando productos de la orden...</p>
      ) : orderItems.length === 0 ? (
        <p className="text-gray-400">Esta orden aún no tiene productos asociados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="bg-gray-800/60 text-left text-sm uppercase tracking-wider">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Cantidad</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {orderItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-gray-200">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-4 py-3">{item.qty}</td>
                  <td className="px-4 py-3 text-gray-200">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-sm text-red-300 hover:text-red-200"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-800/40 text-sm font-semibold">
                <td className="px-4 py-3">Totales</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3">{totals.quantity}</td>
                <td className="px-4 py-3">{formatCurrency(totals.subtotal)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="mt-6 rounded border border-gray-700 bg-gray-800/50 p-4 text-sm text-gray-200">
          <p>
            <span className="font-semibold">Orden:</span> {selectedOrder.order_number}
          </p>
          <p>
            <span className="font-semibold">Estado:</span> {selectedOrder.status}
          </p>
          <p>
            <span className="font-semibold">Productos totales:</span> {totals.quantity}
          </p>
          <p>
            <span className="font-semibold">Subtotal:</span> {formatCurrency(totals.subtotal)}
          </p>
        </div>
      )}
    </div>
  );
}
