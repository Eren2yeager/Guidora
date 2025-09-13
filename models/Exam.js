import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    authority: { type: String, default: '' },
    level: { type: String, enum: ['State', 'National', 'Institution'], default: 'State' },
    scheduleWindow: { type: String, default: '' },
    eligibility: { type: String, default: '' },
    link: { type: String, default: '' },
    region: { type: String, default: '' },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

ExamSchema.index({ name: 1, region: 1 }, { unique: true });
ExamSchema.index({ tags: 1 });

const Exam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
export default Exam;


