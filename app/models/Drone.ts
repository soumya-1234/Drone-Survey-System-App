import mongoose from 'mongoose';
import { DroneStatus } from '../types/mission';

const droneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(DroneStatus),
    default: DroneStatus.AVAILABLE
  },
  batteryLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  lastMaintenance: {
    type: Date,
    required: true,
    default: Date.now
  },
  maxPayload: {
    type: Number,
    required: true,
    min: 0
  },
  maxFlightTime: {
    type: Number,
    required: true,
    min: 0
  },
  maxRange: {
    type: Number,
    required: true,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
droneSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Drone = mongoose.models.Drone || mongoose.model('Drone', droneSchema);

export default Drone; 