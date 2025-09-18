// models/QuizResult.js
import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion', required: true },
  response: {
    optionKeys: [{ type: String }], // MCQ / Checkbox
    value: { type: Number }         // Likert scale
  },
  isCorrect: { type: Boolean }
}, { _id: false });

const QuizResultSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  resultId: { type: String, unique: true, sparse: true },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

  quizType: {
    type: String,
    enum: ['interest', 'aptitude', 'personality', 'comprehensive'],
    default: 'comprehensive'
  },

  answers: [AnswerSchema],

  results: { type: mongoose.Schema.Types.Mixed },

  computedTraits: {
    interests: [{ type: String }],
    strengths: [{ type: String }],
    personality: [{ type: String }]
  },

  recommendedStreams: [{
    stream: { type: String },
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' },
    score: Number
  }],

  recommendedSubjects: [{ type: String }],

  recommendedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

  // NEW FIELD → directly link recommendation
  recommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation' }

}, { timestamps: { createdAt: true, updatedAt: false } });

const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);
export default QuizResult;
