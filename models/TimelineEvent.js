const TimelineEventSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    type: { type: String, enum: ['admission', 'scholarship', 'exam', 'counselling', 'other'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    related: {
      collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      programId: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' },
      state: { type: String, default: '' },
      examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' } // use ObjectId instead of string
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    link: { type: String, default: '' },

    interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TimelineEventSchema.index({ type: 1, 'related.state': 1, startDate: 1 });

const TimelineEvent = mongoose.models.TimelineEvent || mongoose.model('TimelineEvent', TimelineEventSchema);
export default TimelineEvent;
