import mongoose from "mongoose";

const AcademicSchema = new mongoose.Schema(
  {
    score: Number,
    board: String,
    year: Number,
  },
  { _id: false }
);

const EnrollmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    status: {
      type: String,
      enum: ["Ongoing", "Completed", "Dropped"],
      default: "Ongoing",
    },
    grade: String,
  },
  { _id: false }
);

const GoalSchema = new mongoose.Schema(
  {
    careers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Career" }],
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Exam" }],
    degreePrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: "DegreeProgram" }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    colleges: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
    universities: [{ type: mongoose.Schema.Types.ObjectId, ref: "University" }],
    scholarships: [{ type: mongoose.Schema.Types.ObjectId, ref: "Scholarship" }], // NEW
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId },
    // ----------------- AUTH -----------------
    email: {
      type: String,
      required: function () {
        return !this.phone;
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: function () {
        return !this.email;
      },
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.image; // If not OAuth
      },
      minlength: 6,
    },
    name: { type: String, default: "", trim: true },
    media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },

    role: {
      type: String,
      enum: ["Student", "Teacher", "Admin" , "Advisor"],
      default: "Student",
    },

    // ----------------- VERIFICATION -----------------
    resetPasswordOTP: String,
    resetPasswordExpiry: Date,
    phoneResetOTP: String,
    phoneResetExpiry: Date,
    phoneVerificationOTP: String,
    phoneVerificationExpiry: Date,
    isPhoneVerified: { type: Boolean, default: false },

    // ----------------- STUDENT PROFILE -----------------
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: Date,
    classLevel: {
      type: String,
      enum: ["10", "12", "UG", "PG", "Other"],
      default: "12",
    },

    location: {
      district: String,
      state: String,
      pincode: String,
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number] }, // [lng, lat]
      },
    },

    academics: {
      tenth: AcademicSchema,
      twelfth: AcademicSchema,
      undergraduate: AcademicSchema,
      postgraduate: AcademicSchema,
      competitiveExams: [{ exam: String, score: Number, year: Number }],
    },

    college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
    university: { type: mongoose.Schema.Types.ObjectId, ref: "University" },
    degreeProgram: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DegreeProgram",
    },
    enrolledCourses: [EnrollmentSchema],

    interests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],
    goals: GoalSchema, // Using the GoalSchema instead of string array
    preferredLanguages: [
      {
        type: String,
        enum: ["English", "Hindi", "Bengali", "Telugu", "Tamil", "Marathi"],
      },
    ],

    savedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "SavedItem" }],
    quizResults: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizResult" }],
    recommendations: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Recommendation" },
    ],
  },
  { timestamps: true }
);

UserSchema.index({ "location.geo": "2dsphere" });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
