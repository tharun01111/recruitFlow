import express from "express";
import {
  createCompany,
  approveCompany,
  getAllCompanies,
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only routes (role check later)
router.post("/company", protect, createCompany);
router.put("/company/:companyId/approve", protect, approveCompany);
router.get("/companies", protect, getAllCompanies);

export default router;
