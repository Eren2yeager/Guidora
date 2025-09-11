import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function() {
        // Email is required if no phone number is provided
        return !this.phone;
      },
      unique: true,
      sparse: true, // Allows multiple null values
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: function() {
        // Phone is required if no email is provided
        return !this.email;
      },
      unique: true,
      sparse: true, // Allows multiple null values
      trim: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: function() {
        // Password is required only if user is not from OAuth (no image means OAuth user)
        return !this.image;
      },
      minlength: 6,
    },
    // Email-based password reset
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
    // Phone-based password reset
    phoneResetOTP: {
      type: String,
      default: null,
    },
    phoneResetExpiry: {
      type: Date,
      default: null,
    },
    // Phone verification for new registrations
    phoneVerificationOTP: {
      type: String,
      default: null,
    },
    phoneVerificationExpiry: {
      type: Date,
      default: null,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    // Add more fields as needed for your app
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite upon hot-reload in development
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
