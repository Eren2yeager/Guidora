import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  generatedAt: { type: Date, default: Date.now },
  streams: [{ streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' }, score: Number }],
  courses: [{ courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, score: Number }],
  programs: [{ programId: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' }, score: Number }],
  scholarships: [{ scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }, score: Number }],
  rationale: { type: String } // short explainability text
}, { timestamps: false });

const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);
export default Recommendation;

