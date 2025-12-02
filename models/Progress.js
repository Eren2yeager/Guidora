import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    // 0..100 completion percent
    completion: { type: Number, min: 0, max: 100, default: 0 },
    // ISO date when achieved
    completedAt: { type: Date },
    // free-form notes
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    overall: { type: Number, min: 0, max: 100, default: 0 },
    milestones: [MilestoneSchema],
  },
  { timestamps: true }
);

const Progress = mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
export default Progress;


