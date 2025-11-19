import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

export default router;
