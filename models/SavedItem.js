import mongoose from 'mongoose';

const SavedItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  itemType: { type: String, enum: ['course','program','college','scholarship','timeline'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

// unique saved per user per item
SavedItemSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

const SavedItem = mongoose.models.SavedItem || mongoose.model('SavedItem', SavedItemSchema);
export default SavedItem;
