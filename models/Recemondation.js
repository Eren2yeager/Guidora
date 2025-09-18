// models/Recommendation.js
import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  generatedAt: { type: Date, default: Date.now },

  streams: [{ streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' }, score: Number }],
  courses: [{ courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, score: Number }],
  programs: [{ programId: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' }, score: Number }],
  scholarships: [{ scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' }, score: Number }],
  ngos: [{ ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' }, score: Number }], // new
  rationale: { type: String } ,// short explainability text

  // NEW FIELD → trace back to quiz
  quizResultId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' }
});

const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);
export default Recommendation;
