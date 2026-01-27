import bcrypt from "bcryptjs";
import Company from "../models/Company.js";

// CREATE COMPANY (admin only)
export const createCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Company.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Company already exists" });

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// APPROVE / REJECT COMPANY
export const approveCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company)
      return res.status(404).json({ message: "Company not found" });

    company.isApproved = true;
    await company.save();

    res.json({ message: "Company approved" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LIST ALL COMPANIES
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select("-password");
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
