import express from "express";
import { requireAuth } from "../auth/authMiddleware.js";
import { requireAdmin } from "../auth/requireAdmin.js";
import {
  getFactsSnapshot,
  setFacts,
  addFact,
  removeFact
} from "../memory/sutejFacts.js";

const router = express.Router();

router.get("/", requireAuth, requireAdmin, (req, res) => {
  return res.json(getFactsSnapshot());
});

router.put("/", requireAuth, requireAdmin, (req, res) => {
  const { facts } = req.body;
  const updated = setFacts(facts);
  return res.json(updated);
});

router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { fact } = req.body;
  const updated = addFact(fact);
  return res.json(updated);
});

router.delete("/", requireAuth, requireAdmin, (req, res) => {
  const { fact } = req.body;
  const updated = removeFact(fact);
  return res.json(updated);
});

export default router;
