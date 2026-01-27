import express from "express";
import Company from "../models/Company.js";
import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/company/me
 * Company dashboard identity route
 */
router.get("/me", protect, companyOnly, async (req, res) => {
  try {
    const company = await Company.findById(req.user.id).select("-password");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Company me error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
