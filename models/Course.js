import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream', required: true },
    level: { type: String, enum: ['PreU', 'UG', 'Diploma'], default: 'UG' },
    description: { type: String, default: '' },
    eligibility: {
      minMarks: { type: Number, default: 0 },
      requiredSubjects: { type: [String], default: [] },
    },
    outcomes: {
      careers: { type: [String], default: [] },
      govtExams: { type: [String], default: [] },
      privateJobs: { type: [String], default: [] },
      higherStudies: { type: [String], default: [] },
      entrepreneurship: { type: [String], default: [] },
    },
    tags: { type: [String], default: [] },
    media: {
      iconUrl: { type: String, default: '' },
      bannerUrl: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

CourseSchema.index({ streamId: 1 });
CourseSchema.index({ tags: 1 });
CourseSchema.index({ code: 1 }, { unique: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export default Course;
