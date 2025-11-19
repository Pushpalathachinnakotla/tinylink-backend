import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import linkRoutes from "./routes/links.js";
import healthRoutes from "./routes/health.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/links", linkRoutes);
app.use("/healthz", healthRoutes);

// Error handler
app.use(errorHandler);

// Redirect handler
import { pool } from "./db.js";
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  const result = await pool.query("SELECT * FROM links WHERE code=$1", [code]);

  if (result.rowCount === 0) return res.status(404).send("Not found");

  const link = result.rows[0];

  await pool.query(
    `UPDATE links SET total_clicks = total_clicks + 1, last_clicked = NOW() WHERE code=$1`,
    [code]
  );

  return res.redirect(302, link.target_url);
});

// Run migrations and start server
const PORT = process.env.PORT || 5000;

async function runStartup() {
  try {
    // apply migrations if any
    const migPath = path.join(process.cwd(), "src", "migrations", "init.sql");
    try {
      const sql = await fs.readFile(migPath, "utf8");
      if (sql && sql.trim()) {
        await pool.query(sql);
        console.log("Database migrations applied");
      }
    } catch (e) {
      // if migration file missing, log and continue
      console.warn("No migration file applied:", e.message);
    }

    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  } catch (err) {
    console.error("Failed during startup:", err);
    process.exit(1);
  }
}

runStartup();
