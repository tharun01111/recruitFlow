import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import AppError from "../utils/AppError.js";

export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, cgpa, skills, resume } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("Name, email and password are required", 400));
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return next(new AppError("Student already exists", 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
      cgpa,
      skills,
      resume
    });

    const token = jwt.sign(
      { id: student._id, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        cgpa: student.cgpa,
        skills: student.skills
      }
    });
  } catch (error) {
    next(error);
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: student._id, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select("-password");
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { cgpa, skills, resume } = req.body;

    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update only if provided
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (skills !== undefined) student.skills = skills;
    if (resume !== undefined) student.resume = resume;

    const updatedStudent = await student.save();

    res.json({
      _id: updatedStudent._id,
      name: updatedStudent.name,
      email: updatedStudent.email,
      cgpa: updatedStudent.cgpa,
      skills: updatedStudent.skills,
      resume: updatedStudent.resume
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select(
      "-password"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const profileComplete = Boolean(
    student.cgpa !== undefined &&
    student.skills?.length > 0 &&
    student.resume
    );


    res.json({
      name: student.name,
      email: student.email,
      cgpa: student.cgpa || null,
      skills: student.skills || [],
      resume: student.resume || null,
      profileComplete
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const applyToJob = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return next(new AppError("Job not found or inactive.", 404));
    }

    const now = new Date();
    if (
      (job.applyStartAt && now < job.applyStartAt) ||
      (job.applyEndAt && now > job.applyEndAt)
    ) {
      return next(
        new AppError("Applications are not open for this job.", 400)
      );
    }

    const student = await Student.findById(studentId).select("cgpa");
    if (!student) {
      return next(new AppError("Student not found.", 404));
    }

    if (student.cgpa < job.eligibility.minCGPA) {
      return next(
        new AppError(
          `Minimum CGPA required is ${job.eligibility.minCGPA}.`,
          400
        )
      );
    }

    if (job.applicationCap) {
      const count = await JobApplication.countDocuments({ job: jobId });
      if (count >= job.applicationCap) {
        return next(
          new AppError("Application limit reached for this job.", 400)
        );
      }
    }

    const application = await JobApplication.create({
      student: studentId,
      job: jobId,
    });

    res.status(201).json({
      success: true,
      message: "Applied successfully.",
      applicationId: application._id,
    });
  } catch (error) {
    next(error);
  }
};