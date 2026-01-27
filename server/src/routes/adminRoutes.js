import express from "express";
import {
  createCompany,
  approveCompany,
  getAllCompanies,
  createJob,
  getAllJobs,
  closeJob,
  getDashboardStats,
  updateJob,
} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only routes (role check later)
router.post("/company", protect, createCompany);
router.put("/company/:companyId/approve", protect, approveCompany);
router.get("/companies", protect, getAllCompanies);

// Job management (Admin only)
router.post("/jobs", protect, adminOnly, createJob);

//Get all Jobs for Admin
router.get("/jobs", protect, adminOnly, getAllJobs);

//Close the job only admin
router.put("/jobs/:jobId/close", protect, adminOnly, closeJob);

//Get Dashboard stats
router.get("/dashboard/stats", protect, adminOnly, getDashboardStats);

//Update job stats
router.put("/jobs/:jobId", protect, adminOnly, updateJob);

export default router;
