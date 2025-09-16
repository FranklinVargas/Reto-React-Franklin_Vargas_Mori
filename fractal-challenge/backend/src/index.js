import express from "express";
import cors from "cors";
import { db } from "./db.js";
import productRoutes from "./routes/products.js";
import orderProductRoutes from "./routes/orderProducts.js"; 
import orderRoutes from "./routes/orders.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/products", productRoutes);
app.use("/api/order-products", orderProductRoutes); 
app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
