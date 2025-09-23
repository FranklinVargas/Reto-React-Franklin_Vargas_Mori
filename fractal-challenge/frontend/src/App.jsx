import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MyOrders from "./pages/MyOrders";
import AddOrder from "./pages/AddOrder";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950/60 text-slate-100">
        <Navbar />
        <main className="px-4 pb-16 pt-10 md:pt-16">
          <Routes>
            <Route path="/" element={<Navigate to="/my-orders" replace />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/add-order" element={<AddOrder />} />
            <Route path="/add-order/:id" element={<AddOrder />} />
            <Route path="/products" element={<Products />} />
            <Route path="/add-product" element={<AddProduct />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
