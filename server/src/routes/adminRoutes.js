import express from "express";
import {
  createCompany,
  approveCompany,
  getAllCompanies,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/company", protect, adminOnly, createCompany);
router.put("/company/:companyId/approve", protect, adminOnly, approveCompany);
router.get("/companies", protect, adminOnly, getAllCompanies);

export default router;
