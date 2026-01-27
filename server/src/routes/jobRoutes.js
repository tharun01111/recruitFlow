import express from "express";
import {
  getActiveJobs,
  getJobById,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getActiveJobs);
router.get("/:jobId", getJobById);

export default router;
