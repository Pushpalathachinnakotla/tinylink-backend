import { pool } from "../db.js";
import { nanoid } from "nanoid";

export const createLink = async (req, res) => {
  try {
    const { target_url, custom_code } = req.body;

    // Validate URL
    try {
      new URL(target_url);
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const code = custom_code || nanoid(6);

    const exists = await pool.query(
      "SELECT * FROM links WHERE code=$1",
      [code]
    );
    if (exists.rowCount > 0)
      return res.status(409).json({ error: "Code already exists" });

    await pool.query(
      "INSERT INTO links (code, target_url) VALUES ($1, $2)",
      [code, target_url]
    );

    res.status(201).json({ code, target_url });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllLinks = async (req, res) => {
  const result = await pool.query("SELECT * FROM links ORDER BY id DESC");
  res.json(result.rows);
};

export const getStats = async (req, res) => {
  const { code } = req.params;

  const result = await pool.query("SELECT * FROM links WHERE code=$1", [code]);

  if (result.rowCount === 0)
    return res.status(404).json({ error: "Not found" });

  res.json(result.rows[0]);
};

export const deleteLink = async (req, res) => {
  const { code } = req.params;

  const result = await pool.query("DELETE FROM links WHERE code=$1", [code]);

  if (result.rowCount === 0)
    return res.status(404).json({ error: "Not found" });

  res.json({ message: "Deleted" });
};
