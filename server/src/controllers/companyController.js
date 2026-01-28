import Company from "../models/Company.js";

export const getPublicCompanies = async (req, res, next) => {
  try {
    // Only approved companies should be visible publicly
    const companies = await Company.find({ isApproved: true })
      .select("_id name isApproved")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: companies.length,
      companies,
    });
  } catch (error) {
    next(error);
  }
};
