import bcrypt from "bcryptjs";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

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
      return res.status(400).json({ message: "Company is not approved" });
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

//Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalCompanies,
      approvedCompanies,
      totalJobs,
      activeJobs,
      closedJobs,
    ] = await Promise.all([
      Company.countDocuments(),
      Company.countDocuments({ isApproved: true }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Job.countDocuments({ isActive: false }),
    ]);

    res.status(200).json({
      companies: {
        total: totalCompanies,
        approved: approvedCompanies,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        closed: closedJobs,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};

//Update job stats
export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, eligibility, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({ message: "Job not found" });
    }

    const job = await Job.findById(jobId).populate("company");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Block updates if company is not approved
    if (!job.company.isApproved) {
      return res
        .status(400)
        .json({ message: "Cannot update job for unapproved company" });
    }

    // Update allowed fields only
    if (title !== undefined) job.title = title;
    if (description !== undefined) job.description = description;

    if (eligibility) {
      if (eligibility.minCGPA !== undefined) {
        job.eligibility.minCGPA = eligibility.minCGPA;
      }
      if (eligibility.skills !== undefined) {
        job.eligibility.skills = eligibility.skills;
      }
    }

    if (isActive !== undefined) job.isActive = isActive;

    const updatedJob = await job.save();

    res.status(200).json({
      message: "Job updated successfully",
      job: {
        _id: updatedJob._id,
        title: updatedJob.title,
        description: updatedJob.description,
        eligibility: updatedJob.eligibility,
        isActive: updatedJob.isActive,
      },
    });
  } catch (error) {
    // Handle duplicate title error (unique index)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Job title already exists for this company" });
    }

    console.error("Update job error:", error);
    res.status(500).json({ message: "Failed to update job" });
  }
};
