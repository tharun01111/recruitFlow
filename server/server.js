import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import connectDB from "./src/config/db.js";

dotenv.config();
connectDB();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("RecruitFlow server running");
});

// health check (for client handshake later)
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is healthy" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
