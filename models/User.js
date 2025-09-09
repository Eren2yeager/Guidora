import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
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
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
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
