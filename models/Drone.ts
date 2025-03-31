import mongoose from 'mongoose';

const droneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'in-mission', 'maintenance'],
    default: 'available',
  },
  batteryLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  maxPayload: {
    type: Number,
    required: true,
    min: 0,
  },
  maxFlightTime: {
    type: Number,
    required: true,
    min: 0,
  },
  maxRange: {
    type: Number,
    required: true,
    min: 0,
  },
  lastMaintenance: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Drone || mongoose.model('Drone', droneSchema); 