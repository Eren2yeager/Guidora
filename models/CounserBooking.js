import mongoose from 'mongoose';

const CounselingBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  scheduledAt: { type: Date, required: true },
  mode: { type: String, enum: ['video','phone','inperson'], default: 'video' },
  status: { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  notes: String
}, { timestamps: true });

CounselingBookingSchema.index({ userId: 1, counselorId: 1, scheduledAt: 1 });

const CounselingBooking = mongoose.models.CounselingBooking || mongoose.model('CounselingBooking', CounselingBookingSchema);
export default CounselingBooking;
