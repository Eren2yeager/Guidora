import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
_id: { type: mongoose.Schema.Types.ObjectId },

    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    media: {
      iconUrl: { type: String, default: '' },
      bannerUrl: { type: String, default: '' },
    },

    // Academic details
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream', required: true },
    level: { type: String, enum: ['PreU', 'UG', 'PG', 'Diploma', 'Certificate'], default: 'UG' },
    description: { type: String, default: '' },

    // Eligibility
    eligibility: {
      minMarks: { type: Number, default: 0 },
      requiredSubjects: { type: [String], default: [] },
    },

    // Outcomes
    outcomes: {
      careers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Career' }],
      Exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
      higherStudies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // link to other courses
    },

    // Tagging system
    interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],




    // Meta
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes
CourseSchema.index({ streamId: 1 });
CourseSchema.index({ interestTags: 1 });
CourseSchema.index({ code: 1 }, { unique: true });

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export default Course;