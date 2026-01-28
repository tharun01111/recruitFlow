import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "student"
    },

    // 🔽 NEW PROFILE FIELDS
    cgpa: {
      type: Number,
      min: 0,
      max: 10
    },
    skills: {
      type: [String]
    },
    resume: {
      type: String
    }
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
