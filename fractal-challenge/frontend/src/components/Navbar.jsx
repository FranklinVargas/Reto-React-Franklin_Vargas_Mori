import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-4 py-3">
      <div className="max-w-5xl mx-auto flex gap-6">
        <Link to="/my-orders" className="hover:underline">My Orders</Link>
        <Link to="/add-order" className="hover:underline">Add Order</Link>
        <Link to="/add-product">Agregar Producto</Link>

      </div>
    </nav>
  );
}
