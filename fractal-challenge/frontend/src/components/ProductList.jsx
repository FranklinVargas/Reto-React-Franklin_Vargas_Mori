import { useEffect, useState } from "react";
import api from "../api";

function ProductList({ refresh }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, [refresh]);

  return (
    <div>
      <h2>Lista de Productos</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
