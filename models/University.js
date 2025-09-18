import mongoose from "mongoose";

const UniversitySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },

    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["Government", "Private"],
      default: "Government",
    },
    media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },
    description: { type: String, default: "" },
    address: {
      line1: { type: String, default: "" },
      district: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, default: "" },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    facilities: {
      hostel: { type: Boolean, default: false },
      lab: { type: Boolean, default: false },
      library: { type: Boolean, default: false },
      internet: { type: Boolean, default: false },
      medium: { type: [String], default: [] },
    },
    degreePrograms: [
      { type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" },
    ],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    universityAdvisors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Counselor", maxItems: 3 },
    ],
    studentAdvisors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", maxItems: 3 },
    ],
    contacts: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    meta: {
      rank: Number,
      establishedYear: Number,
    },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

// Geospatial index for location queries
UniversitySchema.index({ location: "2dsphere" });
UniversitySchema.index({ "address.state": 1, "address.district": 1 });

const University =
  mongoose.models.University || mongoose.model("University", UniversitySchema);
export default University;
