import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const navigate = useNavigate();

  const saveProduct = async () => {
    if (!name.trim() || !unitPrice) {
      alert("Todos los campos son obligatorios");
      return;
    }

    try {
      await api.post("/products", { name, unitPrice: parseFloat(unitPrice) });
      alert("✅ Producto agregado con éxito");
      navigate("/my-orders");
    } catch (e) {
      alert(e.response?.data?.message || "Error al guardar");
    }
  };

  return (
    <div className="page--full-center">
      <div className="card card--compact" style={{ width: "min(100%, 420px)" }}>
        <h1 className="card__title">➕ Agregar Producto</h1>
        <div className="stack">
          <div className="field">
            <label>Nombre del producto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Ej: Laptop 14''"
            />
          </div>

          <div className="field">
            <label>Precio unitario (S/.)</label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              className="input"
              placeholder="Ej: 2500"
            />
          </div>

          <button
            onClick={saveProduct}
            className="btn btn--primary btn--full"
          >
            💾 Guardar Producto
          </button>
        </div>
      </div>
    </div>
  );
}
