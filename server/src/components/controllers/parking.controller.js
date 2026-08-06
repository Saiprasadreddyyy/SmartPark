import SlotModel from '../models/slot.model.js';
import TicketModel from '../models/ticket.model.js';
import { allocateSlot } from '../services/allocateSlot.service.js';
import { releaseSlot } from '../services/releaseSlot.service.js';
import { getAvailableCount } from '../services/redisAvailability.service.js';
import { emitSlotAllocated, emitSlotReleased, emitStatusUpdate } from '../sockets/parking.socket.js';
import UserModel from "../models/user.model.js";

export async function parkVehicle(req, res) {
  try {
    const { gateId } = req.body;

    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const result = await allocateSlot({
      gateId,
      owner: user.name,
      vehicleNumber: user.vehicleNumber,
      vehicleType: user.vehicleType,
      userId: user._id
    });

    emitSlotAllocated(result);

    const stats = await getStats();
    emitStatusUpdate(stats);

    return res.status(201).json({
      success: true,
      message: `Vehicle parked successfully at ${result.slot.id}`,
      data: result
    });

  } catch (err) {

    return res.status(400).json({
      success: false,
      message: err.message
    });

  }
}

export async function exitVehicle(req, res) {
  try {
    const { ticketId } = req.body;

if (req.user.role === "admin") {
    ticket = await TicketModel.findOne({
        id: ticketId,
        status: "active",
    });
} else {
    ticket = await TicketModel.findOne({
        id: ticketId,
        userId: req.user.id,
        status: "active",
    });
}

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });

  } catch (error) {
    console.error("Exit vehicle error:", error);

    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

export async function getParkedVehicles(req, res) {
  try {
    const tickets = await TicketModel.find({ status: 'active' }).sort({ timestamp: -1 });
    
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Get parked vehicles error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getAllSlots(req, res) {
  try {
    const slots = await SlotModel.find().sort({ floor: 1, id: 1 });
    
    res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error('Get all slots error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getStats() {
  try {
    const totalSlots = await SlotModel.countDocuments();
    const occupiedSlots = await SlotModel.countDocuments({ occupied: true });
    const availableSlots = totalSlots - occupiedSlots;
    const activeTickets = await TicketModel.countDocuments({ status: 'active' });
    

    const gates = ['gateA', 'gateB'];
    const vehicleTypes = ['car', 'motorbike', 'large'];
    
    const availability = {};
    for (const gate of gates) {
      availability[gate] = {};
      for (const type of vehicleTypes) {
        availability[gate][type] = await getAvailableCount(gate, type);
      }
    }
    
    return {
      totalSlots,
      occupiedSlots,
      availableSlots,
      totalFloors: 2,
      activeTickets,
      availability
    };
  } catch (error) {
    console.error('Get stats error:', error);
    throw error;
  }
}

export async function getStatsEndpoint(req, res) {
  try {
    const stats = await getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function getParkingHistory(req, res) {
  try {

    const tickets = await TicketModel
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message
    });

  }
}

export async function getCurrentTicket(req, res) {

    const ticket = await TicketModel.findOne({

        userId: req.user.id,
        status: "active"

    });

   if (!ticket) {
    return res.status(200).json({
        success: true,
        data: null
    });
}

    return res.json({

        success: true,
        data: ticket

    });

}




