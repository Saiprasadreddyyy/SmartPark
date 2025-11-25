import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  floor: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['car', 'motorbike', 'large']
  },
  coords: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  occupied: {
    type: Boolean,
    default: false
  },
  currentTicket: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for faster queries
slotSchema.index({ occupied: 1, type: 1 });
slotSchema.index({ floor: 1 });

const SlotModel = mongoose.model('Slot', slotSchema);

export default SlotModel;