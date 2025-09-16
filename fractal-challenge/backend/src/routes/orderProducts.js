import { Router } from "express";
import { db } from "../db.js";

const router = Router();

/**
 * Agregar un producto a una orden
 */
router.post("/", async (req, res) => {
  try {
    console.log("Body recibido:", req.body); // 👈 Para depuración

    const { order_id, product_id, qty } = req.body;
    if (!order_id || !product_id || !qty) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const [result] = await db.query(
      "INSERT INTO order_products (order_id, product_id, qty) VALUES (?, ?, ?)",
      [order_id, product_id, qty]
    );

    res
      .status(201)
      .json({ id: result.insertId, order_id, product_id, qty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Listar productos de una orden
 */
router.get("/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;

    const [rows] = await db.query(
      `SELECT op.id, p.name, p.price, op.qty, (p.price * op.qty) AS total
       FROM order_products op
       JOIN products p ON p.id = op.product_id
       WHERE op.order_id=?`,
      [order_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Editar cantidad de un producto en la orden
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    await db.query("UPDATE order_products SET qty=? WHERE id=?", [
      qty,
      id,
    ]);

    res.json({ id, qty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Eliminar un producto de la orden
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM order_products WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
