import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    status: {
      type: String,
      enum: ["APPLIED"],
      default: "APPLIED",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One student → one application per job
jobApplicationSchema.index({ student: 1, job: 1 }, { unique: true });

export default mongoose.model("JobApplication", jobApplicationSchema);
