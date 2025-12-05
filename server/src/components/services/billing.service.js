import { v4 as uuidv4 } from 'uuid';
import BillingModel from '../models/billing.schema.js';
import TicketModel from '../models/ticket.model.js';

// Parking rates per hour
const PARKING_RATES = {
  car: 40,
  motorbike: 30,
  large: 60
};

// Tax percentage (GST)
const TAX_RATE = 0.18; // 18%

/**
 * Calculate parking duration
 */
function calculateDuration(entryTime, exitTime) {
  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  
  const totalMinutes = Math.ceil((exit - entry) / (1000 * 60)); // Round up to nearest minute
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return {
    hours,
    minutes,
    totalMinutes
  };
}

/**
 * Calculate parking charges
 */
function calculateCharges(vehicleType, duration) {
  const ratePerHour = PARKING_RATES[vehicleType];
  
  // Calculate amount based on total minutes (hourly rate)
  // Minimum charge: 1 hour
  const chargeableHours = Math.max(1, Math.ceil(duration.totalMinutes / 60));
  const amount = ratePerHour * chargeableHours;
  
  // Calculate tax
  const tax = amount * TAX_RATE;
  
  // Total amount
  const totalAmount = amount + tax;
  
  return {
    ratePerHour,
    amount: parseFloat(amount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2))
  };
}

/**
 * Generate bill for a ticket
 */
async function generateBill(ticketId) {
  try {
    // Get ticket details
    const ticket = await TicketModel.findOne({ id: ticketId });
    
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    
    if (ticket.status !== 'active') {
      throw new Error('Ticket is not active');
    }
    
    const exitTime = new Date();
    const duration = calculateDuration(ticket.timestamp, exitTime);
    const charges = calculateCharges(ticket.vehicleType, duration);
    
    // Create bill
    const bill = new BillingModel({
      billId: `BILL-${uuidv4().substring(0, 8).toUpperCase()}`,
      ticketId: ticket.id,
      vehicleNumber: ticket.vehicleNumber,
      vehicleType: ticket.vehicleType,
      owner: ticket.owner,
      slotId: ticket.slotId,
      entryTime: ticket.timestamp,
      exitTime: exitTime,
      duration: duration,
      ratePerHour: charges.ratePerHour,
      amount: charges.amount,
      tax: charges.tax,
      totalAmount: charges.totalAmount,
      paymentStatus: 'pending'
    });
    
    await bill.save();
    
    return {
      bill: bill.toObject(),
      message: `Bill generated successfully. Total: ₹${charges.totalAmount}`
    };
  } catch (error) {
    console.error('Error generating bill:', error);
    throw error;
  }
}

/**
 * Process payment for a bill
 */
async function processPayment(billId, paymentMethod) {
  try {
    const bill = await BillingModel.findOne({ billId });
    
    if (!bill) {
      throw new Error(`Bill ${billId} not found`);
    }
    
    if (bill.paymentStatus === 'paid') {
      throw new Error('Bill already paid');
    }
    
    // Update payment status
    bill.paymentStatus = 'paid';
    bill.paymentMethod = paymentMethod;
    bill.paidAt = new Date();
    
    await bill.save();
    
    return {
      bill: bill.toObject(),
      message: 'Payment successful'
    };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

/**
 * Get bill by ticket ID
 */
async function getBillByTicket(ticketId) {
  try {
    const bill = await BillingModel.findOne({ ticketId }).sort({ createdAt: -1 });
    return bill;
  } catch (error) {
    console.error('Error getting bill:', error);
    throw error;
  }
}

/**
 * Get all bills (with filters)
 */
async function getAllBills(filters = {}) {
  try {
    const {
      paymentStatus,
      vehicleType,
      startDate,
      endDate,
      limit = 50,
      skip = 0
    } = filters;
    
    const query = {};
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const bills = await BillingModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await BillingModel.countDocuments(query);
    
    return {
      bills,
      total,
      limit,
      skip
    };
  } catch (error) {
    console.error('Error getting bills:', error);
    throw error;
  }
}

/**
 * Get revenue statistics
 */
async function getRevenueStats(startDate, endDate) {
  try {
    const matchStage = {
      paymentStatus: 'paid'
    };
    
    if (startDate || endDate) {
      matchStage.paidAt = {};
      if (startDate) matchStage.paidAt.$gte = new Date(startDate);
      if (endDate) matchStage.paidAt.$lte = new Date(endDate);
    }
    
    const stats = await BillingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalAmount: { $sum: '$amount' },
          totalTax: { $sum: '$tax' },
          totalBills: { $sum: 1 },
          byVehicleType: {
            $push: {
              vehicleType: '$vehicleType',
              amount: '$totalAmount'
            }
          }
        }
      }
    ]);
    
    // Group by vehicle type
    const vehicleTypeStats = await BillingModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    return {
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalAmount: stats[0]?.totalAmount || 0,
      totalTax: stats[0]?.totalTax || 0,
      totalBills: stats[0]?.totalBills || 0,
      byVehicleType: vehicleTypeStats
    };
  } catch (error) {
    console.error('Error getting revenue stats:', error);
    throw error;
  }
}

export {
  generateBill,
  processPayment,
  getBillByTicket,
  getAllBills,
  getRevenueStats,
  PARKING_RATES
};