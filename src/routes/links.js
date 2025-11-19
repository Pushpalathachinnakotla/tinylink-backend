import express from "express";
import {
  createLink,
  getAllLinks,
  getStats,
  deleteLink,
} from "../controllers/links.js";

const router = express.Router();

router.post("/", createLink);
router.get("/", getAllLinks);
router.get("/:code", getStats);
router.delete("/:code", deleteLink);

export default router;
