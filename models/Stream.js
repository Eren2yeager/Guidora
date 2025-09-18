import mongoose from "mongoose";

const StreamSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: { type: String, default: "" },
    media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },
    interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],

    typicalSubjects: [{ type: String }],

    careers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Career" }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    degreePrograms: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" },
    ],
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
    universities: [{ type: mongoose.Schema.Types.ObjectId, ref: "University" }],

    isActive: { type: Boolean, default: true },
    source: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Stream || mongoose.model("Stream", StreamSchema);
