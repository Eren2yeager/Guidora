import mongoose from 'mongoose';

const StreamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    typicalSubjects: { type: [String], default: [] },
    careers: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

StreamSchema.index({ name: 1 }, { unique: true });

const Stream = mongoose.models.Stream || mongoose.model('Stream', StreamSchema);
export default Stream;
