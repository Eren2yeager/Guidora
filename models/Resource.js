import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },

    title: { type: String, required: true, trim: true },

    // Type of resource
    type: {
      type: String,
      enum: ["ebook", "video", "course", "article", "podcast", "webinar"],
      default: "ebook",
    },

    subject: { type: String, default: "" },

    // Link or file
    link: { type: String, default: "" },
    fileUrl: { type: String, default: "" }, // if you upload files
    fileType: { type: String, default: "" }, // e.g., pdf, mp4

    // Coverage scope
    coverageDegrees: { type: [String], default: [] },

    // Relations
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    relatedCareers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Career" }],
    relatedDegreePrograms: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" },
    ],

    // Metadata
    language: { type: String, default: "en" },
    tags: { type: [String], default: [] },
    author: { type: String, default: "" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who suggested/added

    // Source info
    source: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },

    // Engagement tracking
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // System info
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

// Indexes
ResourceSchema.index({ type: 1, subject: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ title: "text", subject: "text", tags: "text" }); // full-text search

const Resource =
  mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

export default Resource;
