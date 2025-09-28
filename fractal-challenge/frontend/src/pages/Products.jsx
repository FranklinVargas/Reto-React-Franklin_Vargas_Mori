import { useEffect, useState } from "react";
import api from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("❌ Error cargando productos:", err);
    }
  };

  const addProduct = async () => {
    if (!name.trim() || !unitPrice) {
      alert("Completa los campos");
      return;
    }

    try {
      await api.post("/products", { name, unitPrice: Number(unitPrice) });
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

  return (
    <div className="page">
      <div className="card stack">
        <h1 className="page__title">📦 Productos</h1>

        <div className="stack">
          <div>
            <h2 className="section-title">➕ Agregar Producto</h2>
            <div className="flex-gap-sm flex-wrap">
              <input
                className="input"
                placeholder="Nombre del producto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ flex: "1 1 220px" }}
              />
              <input
                className="input"
                type="number"
                placeholder="Precio"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                style={{ width: "160px" }}
              />
              <button
                onClick={addProduct}
                className="btn btn--success"
              >
                Guardar
              </button>
            </div>
          </div>

          <div>
            <h2 className="section-title">📋 Lista de Productos</h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.name}</td>
                      <td>S/. {p.unitPrice}</td>
                      <td className="actions">
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="btn btn--link btn--danger-link"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="4" className="table__empty">
                        No hay productos disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
