import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { addUser, findUserByEmail } from "./userStore.js";
import { requireAuth } from "./authMiddleware.js";

const router = express.Router();

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  if (!email.includes("@")) return false;
  return true;
}

function isValidPassword(password) {
  if (typeof password !== "string") return false;
  if (password.length < 6) return false;
  return true;
}

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign(
    {
      email: user.email,
      isAdmin: user.isAdmin === true
    },
    secret,
    {
      subject: user.id,
      expiresIn: "7d"
    }
  );
}

// GET /auth/me
router.get("/me", requireAuth, (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    isAdmin: req.user.isAdmin === true
  });
});

// POST /auth/register
router.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!isValidEmail(email) || !isValidPassword(password)) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: crypto.randomUUID(),
      email: String(email).toLowerCase(),
      passwordHash,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };

    await addUser(user);

    const token = signToken(user);
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Register failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!isValidEmail(email) || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
});

export default router;
