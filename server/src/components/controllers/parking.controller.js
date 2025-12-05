import SlotModel from '../models/slot.model.js';
import TicketModel from '../models/ticket.model.js';
import { allocateSlot } from '../services/allocateSlot.service.js';
import { releaseSlot } from '../services/releaseSlot.service.js';
import { getAvailableCount } from '../services/redisAvailability.service.js';
import { emitSlotAllocated, emitSlotReleased, emitStatusUpdate } from '../sockets/parking.socket.js';


async function parkVehicle(req, res) {
  try {
    const { gateId, vehicleType, vehicleNumber, owner } = req.body;

    const result = await allocateSlot({
      gateId,
      vehicleType,
      vehicleNumber,
      owner
    });

    emitSlotAllocated(result);
    
    const stats = await getStats();
    emitStatusUpdate(stats);

    res.status(201).json({
      success: true,
      message: `Vehicle parked successfully at ${result.slot.id}`,
      data: result
    });
  } catch (error) {
    console.error('Park vehicle error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}


async function exitVehicle(req, res) {
  try {
    const { ticketId } = req.body;

    const result = await releaseSlot(ticketId);


    emitSlotReleased(result);
    

    const stats = await getStats();
    emitStatusUpdate(stats);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Exit vehicle error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}


async function getParkedVehicles(req, res) {
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


async function getAllSlots(req, res) {
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


async function getStats() {
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


async function getStatsEndpoint(req, res) {
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

export {
  parkVehicle,
  exitVehicle,
  getParkedVehicles,
  getAllSlots,
  getStatsEndpoint as getStats
};






