import mongoose from 'mongoose';
// import Notification from './Notification';
// import CounselingSession from './CounselingSession'; // <-- import your session model

const CounselingBookingSchema = new mongoose.Schema({
_id: { type: mongoose.Schema.Types.ObjectId },


  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', required: true },
  scheduledAt: { type: Date, required: true },
  mode: { type: String, enum: ['video', 'phone', 'inperson'], default: 'video' },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  meetingLink: { type: String, default: '' }, // Zoom/Meet link
  notes: String
}, { timestamps: true });

CounselingBookingSchema.index({ userId: 1, counselorId: 1, scheduledAt: 1 });

// Pre-save hook to handle notifications + session creation
CounselingBookingSchema.pre('save', async function (next) {
  if (this.isModified('status') && this.status === 'confirmed' && this.meetingLink) {
    try {
      // Create notification for user
      await Notification.create({
        userId: this.userId,
        type: 'reminder',
        title: 'Your Counseling Session is Confirmed',
        body: `Your session with the counselor is confirmed. Join using this link: ${this.meetingLink}`,
        link: this.meetingLink,
        read: false
      });

      // Also create a session record (if not already created)
      const existingSession = await CounselingSession.findOne({ bookingId: this._id });
      if (!existingSession) {
        await CounselingSession.create({
          bookingId: this._id,
          userId: this.userId,
          counselorId: this.counselorId,
          scheduledAt: this.scheduledAt,
          meetingLink: this.meetingLink,
          status: 'scheduled'
        });
      }

    } catch (err) {
      console.error('Error during booking confirmation flow:', err);
    }
  }
  next();
});

const CounselingBooking = mongoose.models.CounselingBooking || mongoose.model('CounselingBooking', CounselingBookingSchema);
export default CounselingBooking;
