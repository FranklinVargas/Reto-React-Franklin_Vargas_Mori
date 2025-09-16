import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import MyOrders from "./pages/MyOrders";
import AddOrder from "./pages/AddOrder";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";


export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/my-orders" replace />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/add-order" element={<AddOrder />} />
        <Route path="/add-order/:id" element={<AddOrder />} />
        <Route path="/products" element={<Products />} />
        <Route path="/add-product" element={<AddProduct />} />

      </Routes>
    </BrowserRouter>
  );
}
