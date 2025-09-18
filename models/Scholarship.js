import mongoose from 'mongoose';

// Sub-schema for deadlines
const DeadlineSchema = new mongoose.Schema(
  {
    startDate: { type: Date },
    endDate: { type: Date },
    link: { type: String, default: '' },
  },
  { _id: false }
);

const ScholarshipSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true, trim: true },

    media: {
      iconUrl: { type: String, default: '' },
      bannerUrl: { type: String, default: '' },
    },
    providerType: {
      type: String,
      enum: ['College', 'University', 'NGO'],
      required: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'providerType' // dynamic reference
    },

    description: { type: String, default: '' },

    eligibility: {
      minMarks: { type: Number, default: 0 },
      incomeCap: { type: Number, default: 0 },
      state: { type: String, default: '' },
      stream: { type: String, default: '' }, // Science/Arts/Commerce
      reservation: {
        type: [String],
        enum: ['SC', 'ST', 'OBC', 'General', 'EWS'],
        default: [],
      },
      ageLimit: { type: Number }, // optional
      gender: { type: String, enum: ['Male', 'Female', 'Any'], default: 'Any' },
    },

    relatedDegreePrograms: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' },
    ],
    relatedColleges: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    ],
    relatedCareers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Career' }], // new

    benefits: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      coverage: [{ type: String }], // ["tuition", "hostel", "books"]
      notes: { type: String, default: '' }, // descriptive notes
    },

    deadlines: [DeadlineSchema],

    interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],

    isOpen: { type: Boolean, default: true }, // quick check for active cycle
    isActive: { type: Boolean, default: true },

    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

// Indexes for fast search & filtering
ScholarshipSchema.index({ name: 'text', tags: 'text' });
ScholarshipSchema.index({ provider: 1 });
ScholarshipSchema.index({ 'eligibility.state': 1 });
ScholarshipSchema.index({ isOpen: 1 });

const Scholarship =
  mongoose.models.Scholarship ||
  mongoose.model('Scholarship', ScholarshipSchema);

export default Scholarship;
