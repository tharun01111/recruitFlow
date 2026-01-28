import bcrypt from "bcryptjs";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import AppError from "../utils/AppError.js";

/**
 * CREATE COMPANY (Admin only)
 */
export const createCompany = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw new AppError("All fields required", 400);
    }

    const exists = await Company.findOne({ email });
    if (exists) {
      throw new AppError("Company already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      createdByAdmin: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Company created",
      companyId: company._id,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * APPROVE COMPANY (Admin only)
 */
export const approveCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    company.isApproved = true;
    await company.save();

    res.json({
      success: true,
      message: "Company approved successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * LIST ALL COMPANIES (Admin only)
 */
export const getAllCompanies = async (req, res, next) => {
  try {
    const { approved } = req.query;

    const filter = {};
    if (approved !== undefined) {
      filter.isApproved = approved === "true";
    }

    const companies = await Company.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    const companiesWithJobs = await Promise.all(
      companies.map(async (company) => {
        const [total, active, closed] = await Promise.all([
          Job.countDocuments({ company: company._id }),
          Job.countDocuments({ company: company._id, isActive: true }),
          Job.countDocuments({ company: company._id, isActive: false }),
        ]);

        return {
          _id: company._id,
          name: company.name,
          email: company.email,
          isApproved: company.isApproved,
          createdAt: company.createdAt,
          jobs: { total, active, closed },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: companiesWithJobs.length,
      companies: companiesWithJobs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * CREATE JOB (Admin only)
 */
export const createJob = async (req, res, next) => {
  try {
    const { title, description, companyId, eligibility } = req.body;

    if (
      !title ||
      !description ||
      !companyId ||
      !eligibility ||
      eligibility.minCGPA === undefined ||
      !eligibility.skills
    ) {
      throw new AppError("All fields are required", 400);
    }

    const company = await Company.findById(companyId);
    if (!company) {
      throw new AppError("Company not found", 404);
    }

    if (!company.isApproved) {
      throw new AppError("Company is not approved", 400);
    }

    const job = await Job.create({
      title,
      description,
      company: companyId,
      eligibility,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      jobId: job._id,
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(
        new AppError(
          "Job with this title already exists for this company",
          400
        )
      );
    }
    next(err);
  }
};

/**
 * GET ALL JOBS (Admin only)
 */
export const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * CLOSE JOB (Admin only)
 */
export const closeJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (!job.isActive) {
      throw new AppError("Job is already closed", 400);
    }

    job.isActive = false;
    job.closedAt = new Date();
    job.reopenedAt = null;

    await job.save();

    res.json({
      success: true,
      message: "Job closed successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * REOPEN JOB (Admin only)
 */
export const reopenJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;


    const job = await Job.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (job.isActive) {
      throw new AppError("Job is already active", 400);
    }

    job.isActive = true;
    job.reopenedAt = new Date();

    await job.save();

    res.json({
      success: true,
      message: "Job reopened successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DASHBOARD STATS
 */
export const getDashboardStats = async (req, res, next) => {
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
      success: true,
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
  } catch (err) {
    next(err);
  }
};

/**
 * UPDATE JOB (Admin only)
 */
export const updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { title, description, eligibility } = req.body;

    const job = await Job.findById(jobId).populate("company");
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (!job.company.isApproved) {
      throw new AppError(
        "Cannot update job for unapproved company",
        400
      );
    }

    if (!job.isActive) {
      throw new AppError(
        "Closed jobs cannot be updated. Reopen the job first.",
        400
      );
    }

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

    const updatedJob = await job.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job: {
        _id: updatedJob._id,
        title: updatedJob.title,
        description: updatedJob.description,
        eligibility: updatedJob.eligibility,
        isActive: updatedJob.isActive,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(
        new AppError(
          "Job title already exists for this company",
          400
        )
      );
    }
    next(err);
  }
};

/**
 * COMPANY JOB SUMMARY (Dashboard)
 */
export const getCompanyJobSummary = async (req, res, next) => {
  try {
    const companies = await Company.find()
      .select("name isApproved")
      .sort({ createdAt: -1 });

    const summaries = await Promise.all(
      companies.map(async (company) => {
        const [total, active, closed] = await Promise.all([
          Job.countDocuments({ company: company._id }),
          Job.countDocuments({ company: company._id, isActive: true }),
          Job.countDocuments({ company: company._id, isActive: false }),
        ]);

        return {
          _id: company._id,
          name: company.name,
          isApproved: company.isApproved,
          jobs: { total, active, closed },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: summaries.length,
      companies: summaries,
    });
  } catch (err) {
    next(err);
  }
};
