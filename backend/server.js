import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import interpretRoute from "./routes/interpret.js";
import askRoute from "./routes/ask.js";
import authRoutes from "./auth/authRoutes.js";
import factsRoute from "./routes/facts.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
//facts routes
app.use("/facts", factsRoute);

// Auth routes
app.use("/auth", authRoutes);

// Protected AI routes
app.use("/interpret", interpretRoute);
app.use("/ask", askRoute);

app.get("/", (req, res) => {
  res.status(200).send("SutejGPT backend is running ✅");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SutejGPT backend running on port ${PORT}`);
});
