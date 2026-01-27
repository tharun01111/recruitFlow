import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import connectDB from "./src/config/db.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import testRoutes from "./src/routes/testRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";



dotenv.config();
connectDB();

const app = express();
  


// middlewares
app.use(cors());
app.use(express.json());
app.use("/api/test", testRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);



app.use("/api/student", studentRoutes);



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
