import { Router } from "express";
import { db } from "../db.js";

const normalizeProduct = (row) => ({
  ...row,
  price:
    typeof row.price === "string" && row.price.trim() !== ""
      ? Number(row.price)
      : row.price,
});

const parsePayload = (body) => {
  const rawName = typeof body?.name === "string" ? body.name.trim() : "";
  const rawPrice = body?.price;
  const parsedPrice = Number(rawPrice);

  if (!rawName) {
    return { error: "El nombre del producto es obligatorio" };
  }

  if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    return { error: "El precio debe ser un número mayor a 0" };
  }

  return {
    name: rawName,
    price: parsedPrice,
  };
};

const router = Router();

/**
 * Listar todos los productos
 */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products ORDER BY created_at DESC");
    res.json(rows.map(normalizeProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Crear un producto
 */
router.post("/", async (req, res) => {
  try {
    const parsedPayload = parsePayload(req.body);
    if (parsedPayload.error) {
      return res.status(400).json({ error: parsedPayload.error });
    }

    const { name, price } = parsedPayload;

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

    res.json(normalizeProduct(rows[0]));
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
    const parsedPayload = parsePayload(req.body);
    if (parsedPayload.error) {
      return res.status(400).json({ error: parsedPayload.error });
    }

    const { name, price } = parsedPayload;

    const [result] = await db.query("UPDATE products SET name=?, price=? WHERE id=?", [
      name,
      price,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({ id: Number(id), name, price });
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
