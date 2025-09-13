import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizQuestion' },
  optionKey: String
}, { _id: false });

const QuizResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  answers: [AnswerSchema],
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
}, { timestamps: { createdAt: true, updatedAt: false } }); // keep immutable after creation

const QuizResult = mongoose.models.QuizResult || mongoose.model('QuizResult', QuizResultSchema);
export default QuizResult;
