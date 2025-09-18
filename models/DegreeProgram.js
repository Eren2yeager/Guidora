import mongoose from "mongoose";

const DegreeProgramSchema = new mongoose.Schema(
  {
_id: { type: mongoose.Schema.Types.ObjectId },

    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    code: { type: String, trim: true }, // optional program code
    name: { type: String, required: true, trim: true },
    media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },
    durationYears: { type: Number, default: 3 },
    subjects: [
      {
        semester: { type: Number, required: true },
        subjects: [{ type: String }], // just names of subjects
      },
    ],
    medium: { type: [String], default: [] },
    intakeMonths: { type: [Number], default: [] },
    seats: { type: Number, default: 0 },
    cutoff: {
      lastYear: { type: Number, default: 0 },
      categoryWise: {
        type: [{ category: String, cutoff: Number }],
        default: [],
      },
    },
    fees: {
      tuitionPerYear: { type: Number, default: 0 },
      hostelPerYear: { type: Number, default: 0 },
      misc: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    eligibilityOverrides: {
      minMarks: { type: Number },
      requiredSubjects: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      ],
    },
        interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],
    isActive: { type: Boolean, default: true },
    source: { type: String, default: "" },
    sourceUrl: { type: String, default: "" },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

DegreeProgramSchema.index({ collegeId: 1 });
DegreeProgramSchema.index({ courseId: 1 });

const DegreeProgram =
  mongoose.models.DegreeProgram ||
  mongoose.model("DegreeProgram", DegreeProgramSchema);
export default DegreeProgram;
