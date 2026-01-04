import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({ error: "JWT_SECRET not configured" });
    }

    const payload = jwt.verify(token, secret);

    req.user = {
      id: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin === true
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
