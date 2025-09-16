import { Router } from "express";
import { db } from "../db.js";

const router = Router();

/**
 * Crear una nueva orden
 */
router.post("/", async (req, res) => {
  try {
    const { order_number, status } = req.body;
    if (!order_number)
      return res.status(400).json({ error: "order_number requerido" });

    const [result] = await db.query(
      "INSERT INTO orders (order_number, status) VALUES (?, ?)",
      [order_number, status || "Pending"]
    );

    res.status(201).json({ id: result.insertId, order_number, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Listar todas las órdenes
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Obtener una orden por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM orders WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Orden no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Actualizar una orden
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { order_number, status } = req.body;

    await db.query(
      "UPDATE orders SET order_number=?, status=? WHERE id=?",
      [order_number, status, id]
    );

    res.json({ id, order_number, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Eliminar una orden
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM orders WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
