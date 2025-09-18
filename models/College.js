import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema(
  {
_id: { type: mongoose.Schema.Types.ObjectId },


    name: { type: String, required: true, trim: true },
        media: {
      iconUrl: { type: String, default: "" },
      bannerUrl: { type: String, default: "" },
    },
    code: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['Government', 'Private'], default: 'Government' },
    
    university: { type: mongoose.Schema.Types.ObjectId, ref: 'University' },

    // affiliation: { type: String, default: '' },
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

    degreePrograms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    streams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stream' }],
    examsAccepted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],

    collegeAdvisors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Counselor', maxItems: 3 }],
    studentAdvisors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', maxItems: 3 }],

    contacts: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      website: { type: String, default: '' },
    },

    meta: {
      rank: Number,
      establishedYear: Number
    },

    placement: {
      averagePackage: { type: Number, default: 0 }, 
      highestPackage: { type: Number, default: 0 },
      placementRate: { type: Number, default: 0 }
    },

    feesRange: { type: String, default: '' },
    interestTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],

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
