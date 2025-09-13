import mongoose from 'mongoose';

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['ebook', 'video', 'course', 'article'], default: 'ebook' },
    subject: { type: String, default: '' },
    link: { type: String, default: '' },
    coverageDegrees: { type: [String], default: [] },
    language: { type: String, default: 'en' },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

ResourceSchema.index({ type: 1, subject: 1 });
ResourceSchema.index({ tags: 1 });

const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
export default Resource;


