import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['deadline','recommendation','system','reminder'], default: 'system' },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true },
  link: { type: String, default: '' },
  read: { type: Boolean, default: false },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedType' },
  relatedType: { type: String, enum: ['Course','Program','College','Scholarship','TimelineEvent'] },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
