import mongoose from 'mongoose';

const CareerSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    sectors: { type: [String], default: [] },
    entryRoles: { type: [String], default: [] },
    medianPayBand: {
      currency: { type: String, default: 'INR' },
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    skillsRequired: { type: [String], default: [] },
    typicalDegrees: { type: [String], default: [] },
    typicalCourses: { type: [String], default: [] },
    exams: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

CareerSchema.index({ slug: 1 }, { unique: true });
CareerSchema.index({ tags: 1 });

const Career = mongoose.models.Career || mongoose.model('Career', CareerSchema);
export default Career;


