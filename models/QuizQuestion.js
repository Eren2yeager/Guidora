// models/QuizQuestion.js
import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema({
  key: { type: String, required: true },
  text: { type: Map, of: String }, // multilingual: { en: '...', hi: '...' }
  weight: { type: Number, default: 1 }, // used to score traits
  tags: [{ type: String }] // e.g., ['math','science','creative']
}, { _id: false });

const QuizQuestionSchema = new mongoose.Schema({
  category: { type: String, enum: ['interest','aptitude','personality'], required: true },
  text: { type: Map, of: String, required: true }, // multilingual
  options: [OptionSchema],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

QuizQuestionSchema.index({ 'text.en': 'text' }); // optional

const QuizQuestion = mongoose.models.QuizQuestion || mongoose.model('QuizQuestion', QuizQuestionSchema);
export default QuizQuestion;
