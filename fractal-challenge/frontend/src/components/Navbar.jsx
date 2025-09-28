import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <Link to="/my-orders" className="navbar__link">My Orders</Link>
        <Link to="/add-order" className="navbar__link">Add Order</Link>
        <Link to="/add-product" className="navbar__link">Agregar Producto</Link>
      </div>
    </nav>
  );
}
