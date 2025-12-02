import mongoose from 'mongoose';

const SavedItemSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemType: { type: String, enum: ['Course','Career','Program','College','Scholarship','TimelineEvent'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true , refPath: 'itemType' },
}, { timestamps: true });

// unique saved per user per item
SavedItemSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

const SavedItem = mongoose.models.SavedItem || mongoose.model('SavedItem', SavedItemSchema);
export default SavedItem;
