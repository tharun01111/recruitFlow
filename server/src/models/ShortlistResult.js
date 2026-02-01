import mongoose from "mongoose";

const shortlistResultSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      unique: true, 
    },

    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    triggeredAt: {
      type: Date,
      default: Date.now,
    },

    summary: {
      totalApplicants: Number,
      shortlistedCount: Number,
      rejectedCount: Number,
    },

    results: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["SHORTLISTED", "REJECTED"],
          required: true,
        },
        reasons: {
          type: [String],
          default: [],
        },
        matchedSkills: {
          type: [String],
          default: [],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ShortlistResult", shortlistResultSchema);
