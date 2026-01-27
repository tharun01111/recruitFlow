import express from "express";
import { registerAdmin, loginAdmin, loginCompany } from "../controllers/authController.js";

const router = express.Router();

router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);
router.post("/company/login", loginCompany);


export default router;
