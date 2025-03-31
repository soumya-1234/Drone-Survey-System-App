import mongoose from 'mongoose';
import { MissionStatus } from '@/app/types/mission';

const missionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'aborted', 'paused'],
    default: 'scheduled',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: false,
  },
  area: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true,
    },
    coordinates: {
      type: [[[Number]]],
      required: true,
    },
  },
  droneId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'Drone',
    set: function(v: any) {
      if (v === '') return null;
      return v;
    }
  },
  location: {
    type: String,
    required: true,
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
missionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Mission = mongoose.models.Mission || mongoose.model('Mission', missionSchema);

export default Mission; 