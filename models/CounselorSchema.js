import mongoose from "mongoose";
import Interest from "./Interest.js";
import User from "./User.js";
const AvailableSlotSchema = new mongoose.Schema(
  {
_id: { type: mongoose.Schema.Types.ObjectId },


    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: { type: Boolean, default: false },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const RatingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rating: { type: Number, min: 0, max: 5 },
  },
  { _id: false }
);

const CounselorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    image: { type: String, default: "" },
    role: { type: String, enum: ["Counselor"], default: "Counselor" },

    // Connect to your existing interest tags
    interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],

    // Optional broader expertise
    expertise: [{ type: String }],

    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Available time slots for booking
    availableSlots: [AvailableSlotSchema],

    // Ratings & feedback from users
    ratings: [RatingSchema],

    isActive: { type: Boolean, default: true },

    media: { iconUrl: String, bannerUrl: String },
  },
  { timestamps: true }
);

// Method to confirm a counseling session and add meeting link
CounselorSchema.methods.confirmSession = async function (
  bookingId,
  meetingLink
) {
  const counselorBooking = await CounselingBooking.findById(bookingId);
  if (!counselorBooking) throw new Error("booking not found");

  counselorBooking.status = "confirmed";
  counselorBooking.meetingLink = meetingLink;
  await counselorBooking.save(); // triggers notification hook

  return counselorBooking;
};

// Index for quick lookup by interest tags
CounselorSchema.index({ interestTags: 1 });
CounselorSchema.index({ isActive: 1 });

const Counselor =
  mongoose.models.Counselor || mongoose.model("Counselor", CounselorSchema);

export default Counselor;
