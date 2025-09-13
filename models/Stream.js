import mongoose from 'mongoose';

const StreamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Science','Commerce','Arts','Vocational','Other'],
    trim: true,
  },
  slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
  description: { type: String, default: '' },
  typicalSubjects: [{ type: String }],
  careers: [{ type: String }],
  isActive: { type: Boolean, default: true },
  source: { type: String, default: '' },
  sourceUrl: { type: String, default: '' },
  lastUpdated: { type: Date },
}, { timestamps: true });

export default mongoose.models.Stream || mongoose.model('Stream', StreamSchema);
