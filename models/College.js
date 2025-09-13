import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['Government', 'Private'], default: 'Government' },
    affiliation: { type: String, default: '' },
    address: {
      line1: { type: String, default: '' },
      district: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, default: '' },
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    facilities: {
      hostel: { type: Boolean, default: false },
      lab: { type: Boolean, default: false },
      library: { type: Boolean, default: false },
      internet: { type: Boolean, default: false },
      medium: { type: [String], default: [] },
    },
    contacts: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
    },
    meta: {
      rank: Number,
      establishedYear: Number
    } ,
    isActive: { type: Boolean, default: true },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    lastUpdated: { type: Date },
  },
  { timestamps: true }
);

CollegeSchema.index({ location: '2dsphere' });
CollegeSchema.index({ 'address.state': 1, 'address.district': 1 });

const College = mongoose.models.College || mongoose.model('College', CollegeSchema);
export default College;