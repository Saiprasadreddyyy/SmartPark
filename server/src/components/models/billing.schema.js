import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  billId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ticketId: {
    type: String,
    required: true,
    ref: 'Ticket'
  },
  vehicleNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'motorbike', 'large']
  },
  owner: {
    type: String,
    required: true
  },
  slotId: {
    type: String,
    required: true
  },
  entryTime: {
    type: Date,
    required: true
  },
  exitTime: {
    type: Date,
    required: true
  },
  duration: {
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    totalMinutes: { type: Number, required: true }
  },
  ratePerHour: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet', null],
    default: null
  },
  paidAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for fast queries
billingSchema.index({ paymentStatus: 1 });
billingSchema.index({ vehicleNumber: 1 });
billingSchema.index({ createdAt: -1 });

const BillingModel = mongoose.model('Billing', billingSchema);

export default BillingModel;