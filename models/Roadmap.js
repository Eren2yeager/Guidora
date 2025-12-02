import mongoose from 'mongoose';

const RoadmapStepSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    // e.g. onboarding, assessment, mentor, applications
    category: { type: String, default: 'general' },
    // 0..1 default weight for priority ordering
    weight: { type: Number, default: 0.5 },
    // optional reference to entity
    entityType: { type: String, enum: ['Career','Course','Program','College','Scholarship','Exam','Stream','None'], default: 'None' },
    entityId: { type: mongoose.Schema.Types.ObjectId },
  },
  { _id: false }
);

const RoadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    generatedFrom: {
      quizResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' },
      rationale: { type: String, default: '' },
    },
    steps: [RoadmapStepSchema],
  },
  { timestamps: true }
);

const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);
export default Roadmap;


