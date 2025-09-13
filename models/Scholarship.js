import mongoose from 'mongoose';

const DeadlineSchema = new mongoose.Schema({
  startDate: { type: Date },
  endDate: { type: Date },
  link: { type: String, default: '' }
}, { _id: false });

const ScholarshipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    provider: { type: String, enum: ['Gov','College','NGO','Private','Other'], default: 'Gov' },
    description: { type: String, default: '' },
    eligibility: {
      minMarks: { type: Number, default: 0 },
      incomeCap: { type: Number, default: 0 },
      state: { type: String, default: '' },
      stream: { type: String, default: '' },
      reservation: [{ type: String }]
    },
    benefits: {
      amount: { type: Number, default: 0 },
      coverage: [{ type: String }] // ["tuition","hostel","books"]
    },
    deadlines: [DeadlineSchema],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

ScholarshipSchema.index({ name: 'text', tags: 'text' });
ScholarshipSchema.index({ provider: 1 });
ScholarshipSchema.index({ 'eligibility.state': 1 });

const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);
export default Scholarship;

