import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
  slotId: {
    type: String,
    required: true,
    ref: 'Slot'
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  owner: {
    type: String,
    required: true
  },
  gateId: {
    type: String,
    required: true,
    enum: ['gateA', 'gateB']
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'motorbike', 'large']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

ticketSchema.index({ status: 1 });
ticketSchema.index({ slotId: 1 });
ticketSchema.index({ vehicleNumber: 1 });

const TicketModel = mongoose.model('Ticket', ticketSchema);

export default TicketModel;