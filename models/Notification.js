import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, enum: ['deadline','recommendation','system','reminder'], default: 'system' },
  title: String,
  body: String,
  link: String,
  read: { type: Boolean, default: false }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1 });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
