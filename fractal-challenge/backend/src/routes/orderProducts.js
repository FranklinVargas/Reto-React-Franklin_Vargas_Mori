import { Router } from "express";
import { db } from "../db.js";

const router = Router();

const parsePositiveInt = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
};

/**
 * Agregar un producto a una orden
 */
router.post("/", async (req, res) => {
  try {
    const orderId = parsePositiveInt(req.body?.order_id);
    const productId = parsePositiveInt(req.body?.product_id);
    const quantity = parsePositiveInt(req.body?.qty);

    if (!orderId || !productId || !quantity) {
      return res.status(400).json({
        error: "Debes enviar order_id, product_id y qty como enteros mayores a 0",
      });
    }

    const [result] = await db.query(
      "INSERT INTO order_products (order_id, product_id, qty) VALUES (?, ?, ?)",
      [orderId, productId, quantity]
    );

    res.status(201).json({
      id: result.insertId,
      order_id: orderId,
      product_id: productId,
      qty: quantity,
    });
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
    const quantity = parsePositiveInt(req.body?.qty);

    if (!quantity) {
      return res
        .status(400)
        .json({ error: "La cantidad debe ser un entero mayor a 0" });
    }

    const [result] = await db.query("UPDATE order_products SET qty=? WHERE id=?", [
      quantity,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado en la orden" });
    }

    res.json({ id: Number(id), qty: quantity });
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
