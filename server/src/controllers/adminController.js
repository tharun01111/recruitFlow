import bcrypt from "bcryptjs";
import Company from "../models/Company.js";
import Job from "../models/Job.js";

// CREATE COMPANY (Admin only)
export const createCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await Company.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      createdByAdmin: req.user.id,
    });

    res.status(201).json({
      message: "Company created",
      companyId: company._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// APPROVE COMPANY (Admin only)
export const approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isApproved = true;
    await company.save();

    res.json({ message: "Company approved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST ALL COMPANIES (Admin only)
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select("-password");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Create JOB(Admin only)
export const createJob = async (req, res) => {
  try {
    const { title, description, companyId, eligibility } = req.body;

    // Basic validation
    if (
      !title ||
      !description ||
      !companyId ||
      !eligibility ||
      eligibility.minCGPA === undefined ||
      !eligibility.skills
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check company existence and approval
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.isApproved) {
      return res
        .status(400)
        .json({ message: "Company is not approved" });
    }

    // Create job
    const job = await Job.create({
      title,
      description,
      company: companyId,
      eligibility,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Job created successfully",
      jobId: job._id,
    });
  } catch (err) {
    // Duplicate title per company
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Job with this title already exists for this company",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

//Get all Jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CLOSE JOB (Admin only)
export const closeJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.isActive = false;
    await job.save();

    res.json({ message: "Job closed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
