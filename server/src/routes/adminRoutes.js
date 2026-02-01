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
  deleteCompany,
  runShortlisting,
} from "../controllers/adminController.js";

import validateObjectId from "../middleware/validateObjectId.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * COMPANY (Admin only)
 */
router.post("/company", protect, adminOnly, createCompany);

router.put(
  "/company/:companyId/approve",
  protect,
  adminOnly,
  validateObjectId("companyId"),
  approveCompany,
);

router.get("/companies", protect, adminOnly, getAllCompanies);

router.delete(
  "/company/:companyId",
  protect,
  adminOnly,
  validateObjectId("companyId"),
  deleteCompany,
);

/**
 * JOB MANAGEMENT (Admin only)
 */
router.post("/jobs", protect, adminOnly, createJob);

router.get("/jobs", protect, adminOnly, getAllJobs);

router.put(
  "/jobs/:jobId/close",
  protect,
  adminOnly,
  validateObjectId("jobId"),
  closeJob,
);

router.patch(
  "/jobs/:jobId/reopen",
  protect,
  adminOnly,
  validateObjectId("jobId"),
  reopenJob,
);

router.put(
  "/jobs/:jobId",
  protect,
  adminOnly,
  validateObjectId("jobId"),
  updateJob,
);

/**
 * DASHBOARD
 */
router.get("/dashboard/stats", protect, adminOnly, getDashboardStats);

router.get(
  "/dashboard/company-summary",
  protect,
  adminOnly,
  getCompanyJobSummary,
);

//Run admin shortlist
router.post(
  "/jobs/:jobId/shortlist",
  protect,
  adminOnly,
  runShortlisting
);

export default router;
