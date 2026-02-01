import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    eligibility: {
      minCGPA: {
        type: Number,
        required: true,
      },
      skills: {
        type: [String],
        required: true,
      },
      minSkillMatch: {
        type: Number,
        default: 1,
      },
    },

    applyStartAt: {
      type: Date,
    },

    applyEndAt: {
      type: Date,
    },

    applicationCap: {
      type: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    reopenedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

/**
 * Prevent duplicate job titles within the same company
 * Same title across different companies is allowed
 */
jobSchema.index({ company: 1, title: 1 }, { unique: true });

export default mongoose.model("Job", jobSchema);
