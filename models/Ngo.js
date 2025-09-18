import mongoose from 'mongoose';

const NgoSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId },
  name: { type: String, required: true },
  type: { type: String, default: 'NGO' },
  description: { type: String, default: '' },
  media: { 
    iconUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' }
  },
  programs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship' // can also add Mentorship, Workshop models later
  }],
  contacts: {
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  location: {
    district: String,
    state: String,
    geo: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] } // [lng, lat]
    }
  },
  interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Interest" }],
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date }
}, { timestamps: true });

NgoSchema.index({ 'location.geo': '2dsphere' });

const NGO = mongoose.models.NGO || mongoose.model('NGO', NgoSchema);
export default NGO;
