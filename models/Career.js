import mongoose from "mongoose";

const CareerSchema = new mongoose.Schema(
  {
    // _id is optional for inserts, but we allow it for imports
    _id: { type: mongoose.Schema.Types.ObjectId },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    name: { type: String, required: true, trim: true },

    media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },

    description: { type: String, default: "" },

    sectors: [ { type: String } ], // e.g. ["Healthcare", "IT"]
    entryRoles: [ { type: String }], // e.g. ["Junior Developer"]

    medianPayBand: {
      currency: { type: String, default: "INR" },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },

    skillsRequired: { type: [String], default: [] },

    // Education paths (IDs, but can be empty for import)
    typicalDegrees: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" },
    ],
    typicalCourses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    ],
    exams: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    ],

    // Scholarships that support this career path
    relatedScholarships: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Scholarship" },
    ],

    // Career growth & future
    growthTrend: {
      type: String,
      default: "Stable",
    },
    relatedCareers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Career" },
    ],

    // Interest mapping
    interestTags: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Interest" },
    ],

    // Status
    isActive: { type: Boolean, default: true },

    // Data source
    source: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    lastUpdated: { type: Date },
    // createdAt and updatedAt will be handled by timestamps
  },
  { timestamps: true }
);

// Indexes for fast lookup and search
CareerSchema.index({ slug: 1 }, { unique: true });
CareerSchema.index({ name: "text", description: "text", sectors: 1 });
CareerSchema.index({ growthTrend: 1 });

const Career =
  mongoose.models.Career || mongoose.model("Career", CareerSchema);

export default Career;
