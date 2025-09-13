import mongoose from 'mongoose';

const TimelineEventSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['admission', 'scholarship', 'exam', 'counselling', 'other'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    related: {
      collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      programId: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' },
      state: { type: String, default: '' },
      examCode: { type: String, default: '' }
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    link: { type: String, default: '' },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

TimelineEventSchema.index({ type: 1, 'related.state': 1, startDate: 1 });

const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', TimelineEventSchema);
export default TimelineEvent;
