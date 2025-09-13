import mongoose from 'mongoose';

const CounselorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: String,
  expertise: [{ type: String }], // e.g., "career guidance", "counselling"
  languages: [{ type: String }], // ['en','hi']
  availability: [{
    dayOfWeek: { type: Number }, // 0-6
    startTime: String, // "09:30"
    endTime: String // "17:00"
  }],
  contact: {
    email: String,
    phone: String,
    profileUrl: String
  },
  isVolunteer: { type: Boolean, default: true }
}, { timestamps: true });

const Counselor = mongoose.models.Counselor || mongoose.model('Counselor', CounselorSchema);
export default Counselor;
