import mongoose from "mongoose";

const InterestSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true, unique: true, trim: true },
    media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },

    // 🔗 Linked ecosystem
    streams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stream" }],
    careers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Career" }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    degreePrograms: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" },
    ],
    colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
    universities: [{ type: mongoose.Schema.Types.ObjectId, ref: "University" }],
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],

    // Metadata
    popularity: { type: Number, default: 0 }, // trending
    isActive: { type: Boolean, default: true },
    source: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Interest ||
  mongoose.model("Interest", InterestSchema);
