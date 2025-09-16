import { useState } from "react";
import api from "../api";

function ProductForm({ onCreated }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/products", { name, price: parseFloat(price) });
    setName("");
    setPrice("");
    onCreated(); // refrescar lista
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nombre del producto"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Precio"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button type="submit">Agregar</button>
    </form>
  );
}

export default ProductForm;
