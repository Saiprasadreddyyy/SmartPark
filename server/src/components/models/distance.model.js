import mongoose from 'mongoose';

const distanceSchema = new mongoose.Schema({
  slotId: {
    type: String,
    required: true,
    index: true
  },
  gateId: {
    type: String,
    required: true,
    enum: ['gateA', 'gateB']
  },
  distance: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for fast lookups
distanceSchema.index({ slotId: 1, gateId: 1 }, { unique: true });

const DistanceModel = mongoose.model('Distance', distanceSchema);

export default DistanceModel;