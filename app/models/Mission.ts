import mongoose from 'mongoose';
import { MissionStatus } from '../types/mission';

const missionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(MissionStatus),
    default: MissionStatus.PENDING
  },
  droneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  flightPath: {
    type: [[Number]], // Array of [longitude, latitude] coordinates
    required: true
  },
  altitude: {
    type: Number,
    required: true,
    min: 0
  },
  speed: {
    type: Number,
    required: true,
    min: 0
  },
  dataCollection: {
    frequency: {
      type: Number,
      required: true,
      min: 1
    },
    sensors: [{
      type: String,
      enum: ['RGB Camera', 'Thermal Camera', 'LiDAR', 'Multispectral'],
      required: true
    }],
    resolution: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
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
missionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Mission = mongoose.models.Mission || mongoose.model('Mission', missionSchema);

export default Mission; 