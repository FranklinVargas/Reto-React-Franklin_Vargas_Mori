import { Router } from "express";
import { db } from "../db.js";

const router = Router();

/**
 * Listar todos los productos
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Crear un producto
 */
router.post("/", async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    const [result] = await db.query(
      "INSERT INTO products (name, price) VALUES (?, ?)",
      [name, price]
    );

    res.status(201).json({ id: result.insertId, name, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Obtener un producto por ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM products WHERE id=?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Actualizar un producto
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    await db.query("UPDATE products SET name=?, price=? WHERE id=?", [
      name,
      price,
      id,
    ]);

    res.json({ id, name, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Eliminar un producto
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM products WHERE id=?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
