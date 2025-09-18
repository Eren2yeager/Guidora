import mongoose from "mongoose";

const CounselingSessionSchema = new mongoose.Schema(
  {
_id: { type: mongoose.Schema.Types.ObjectId },


    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CounselingBooking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },
    scheduledAt: { type: Date, required: true },
    meetingLink: { type: String },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },

    // Counselor adds this after session
    notes: { type: String },
    duration: { type: Number }, // in minutes

    // User adds this after completion
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
  },
  { timestamps: true }
);

CounselingSessionSchema.index({ userId: 1, counselorId: 1, startTime: 1 });

const CounselingSession =
  mongoose.models.CounselingSession ||
  mongoose.model("CounselingSession", CounselingSessionSchema);

export default CounselingSession;
