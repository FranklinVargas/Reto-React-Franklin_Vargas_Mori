import { useState } from "react";
import { createOrder } from "../api";

function OrderForm({ onOrderCreated }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [status, setStatus] = useState("Pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createOrder({ order_number: orderNumber, status });
    setOrderNumber("");
    setStatus("Pending");
    onOrderCreated();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Número de Orden"
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="Pending">Pending</option>
        <option value="InProgress">In Progress</option>
        <option value="Completed">Completed</option>
      </select>
      <button type="submit">Crear Orden</button>
    </form>
  );
}

export default OrderForm;
