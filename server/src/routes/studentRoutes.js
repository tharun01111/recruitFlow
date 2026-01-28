import express from "express";
import {
  registerStudent,
  loginStudent,
  getStudentProfile,
  updateStudentProfile,
   getStudentDashboard
} from "../controllers/studentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.get("/profile", protect, getStudentProfile);

// 🔽 NEW
router.put("/profile", protect, updateStudentProfile);
router.get("/dashboard", protect, getStudentDashboard);

export default router;
