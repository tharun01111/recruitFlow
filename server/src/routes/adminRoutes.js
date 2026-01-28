import express from "express";
import {
  createCompany,
  approveCompany,
  getAllCompanies,
  createJob,
  getAllJobs,
  closeJob,
  reopenJob,
  getDashboardStats,
  updateJob,
  getCompanyJobSummary,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only routes (role check later)
router.post("/company", protect, createCompany);
router.put("/company/:companyId/approve", protect, approveCompany);
router.get("/companies", protect, adminOnly, getAllCompanies);

// Job management (Admin only)
router.post("/jobs", protect, adminOnly, createJob);

//Get all Jobs for Admin
router.get("/jobs", protect, adminOnly, getAllJobs);

//Close the job only admin
router.put("/jobs/:jobId/close", protect, adminOnly, closeJob);

// Reopen job (Admin only)
router.patch("/jobs/:jobId/reopen", protect, adminOnly, reopenJob);

//Get Dashboard stats
router.get("/dashboard/stats", protect, adminOnly, getDashboardStats);

//Update job stats
router.put("/jobs/:jobId", protect, adminOnly, updateJob);

//Get Job summary
router.get("/dashboard/company-summary", protect, adminOnly, getCompanyJobSummary);

export default router;
