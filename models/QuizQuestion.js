import mongoose from 'mongoose';

const OptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true }, // e.g., 'A','B','C'
    text: { type: Map, of: String }, // multilingual: { en: '...', hi: '...' }
    weight: { type: Number, default: 1 }, // scoring weight
    tags: [{ type: String }], // e.g., ['math','science','creative']
  },
  { _id: false }
);

const QuizQuestionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    category: {
      type: String,
      enum: ['interest', 'aptitude', 'personality', 'comprehensive'],
      required: true,
      index: true,
    },
    text: { type: Map, of: String, required: true }, // multilingual question text
    options: [OptionSchema],

    // Mapping to learning paths
    relatedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    relatedCareers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Career' }],
    relatedStreams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stream' }],
    interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],

    // UI / Control
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    section: { type: String, default: '' }, // optional: for grouping (Maths section, Logical section etc.)
  },
  { timestamps: true }
);

// Text search in English, add indexing
QuizQuestionSchema.index({ 'text.en': 'text' });

const QuizQuestion =
  mongoose.models.QuizQuestion ||
  mongoose.model('QuizQuestion', QuizQuestionSchema);

export default QuizQuestion;
