import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  missionId: {
    type: String,
    required: true,
  },
  missionName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'processing', 'failed'],
    default: 'processing',
  },
  type: {
    type: String,
    enum: ['survey', 'inspection', 'mapping'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  coverage: {
    type: Number,
    min: 0,
    max: 100,
    required: true,
  },
  imageCount: {
    type: Number,
    min: 0,
    default: 0,
  },
  downloadUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
reportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report; 