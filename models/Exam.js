import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema(
  {
_id: { type: mongoose.Schema.Types.ObjectId },

    name: { type: String, required: true, trim: true },
    media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },
    authority: { type: String, default: '' },
    level: { type: String, enum: ['State', 'National', 'Institution'], default: 'State' },
    
    examType: { 
      type: String, 
      enum: ['Entrance', 'Scholarship', 'Recruitment', 'Certification'], 
      default: 'Entrance' 
    },

    scheduleWindow: { type: String, default: '' },
    applicationStart: { type: Date },
    applicationEnd: { type: Date },
    examDate: { type: Date },
    resultDate: { type: Date },

    eligibility: { type: String, default: '' },
    mode: { type: String, enum: ['Online', 'Offline', 'Both'], default: 'Online' },
    pattern: { type: String, default: '' },

    link: { type: String, default: '' }, // application link
    officialWebsite: { type: String, default: '' },

    region: { type: String, default: '' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    careers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Career' }],

     interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],
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
