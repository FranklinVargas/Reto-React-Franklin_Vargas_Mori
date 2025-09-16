import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderProductsPage from "./pages/OrderProductsPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* 🔹 Barra de navegación */}
        <nav className="bg-gray-800 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex justify-center space-x-8">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition ${
                  isActive ? "bg-green-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`
              }
            >
              🛒 Productos
            </NavLink>

            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`
              }
            >
              📑 Órdenes
            </NavLink>

            <NavLink
              to="/order-products"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold transition ${
                  isActive ? "bg-purple-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"
                }`
              }
            >
              🔗 Órdenes + Productos
            </NavLink>
          </div>
        </nav>

        {/* 🔹 Contenido */}
        <div className="container mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<ProductsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/order-products" element={<OrderProductsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
