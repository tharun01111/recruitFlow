import Job from "../models/Job.js";

// GET ALL ACTIVE JOBS (Public)
export const getActiveJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate("company", "name")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE JOB (Public)
export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findOne({
      _id: jobId,
      isActive: true,
    }).populate("company", "name");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
