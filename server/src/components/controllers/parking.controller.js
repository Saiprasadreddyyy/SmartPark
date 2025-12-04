import SlotModel from '../models/slot.model.js';
import TicketModel from '../models/ticket.model.js';
import { allocateSlot } from '../services/allocateSlot.service.js';
import { releaseSlot } from '../services/releaseSlot.service.js';
import { getAvailableCount } from '../services/redisAvailability.service.js';
import { emitSlotAllocated, emitSlotReleased, emitStatusUpdate } from '../sockets/parking.socket.js';

/**
 * Park a vehicle
 */
async function parkVehicle(req, res) {
  try {
    const { gateId, vehicleType, vehicleNumber, owner } = req.body;

    const result = await allocateSlot({
      gateId,
      vehicleType,
      vehicleNumber,
      owner
    });

    // Emit socket event
    emitSlotAllocated(result);
    
    // Get stats and emit update
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

/**
 * Exit a vehicle
 */
async function exitVehicle(req, res) {
  try {
    const { ticketId } = req.body;

    const result = await releaseSlot(ticketId);

    // Emit socket event
    emitSlotReleased(result);
    
    // Get stats and emit update
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

/**
 * Get all parked vehicles
 */
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

/**
 * Get all parking slots
 */
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

/**
 * Get parking statistics
 */
async function getStats() {
  try {
    const totalSlots = await SlotModel.countDocuments();
    const occupiedSlots = await SlotModel.countDocuments({ occupied: true });
    const availableSlots = totalSlots - occupiedSlots;
    const activeTickets = await TicketModel.countDocuments({ status: 'active' });
    
    // Get availability per gate and type
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

/**
 * Get parking statistics endpoint
 */
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







// import Parking from "../models/parking.model.js";
// import { allocateSlot } from "../services/allocateSlot.service.js";
// import { releaseSlot } from "../services/releaseSlot.service.js";
// import { getAvailableCount } from "../services/redisAvailability.service.js";
// import {
//   emitSlotAllocated,
//   emitSlotReleased,
//   emitStatusUpdate
// } from "../sockets/parking.socket.js";

// /**
//  * Park a vehicle
//  */
// async function parkVehicle(req, res) {
//   try {
//     const { gateId, vehicleType, vehicleNumber, owner } = req.body;

//     const result = await allocateSlot({
//       gateId,
//       vehicleType,
//       vehicleNumber,
//       owner
//     });

//     // Emit socket event
//     emitSlotAllocated(result);
//     emitStatusUpdate(Parking.getStats());

//     res.status(201).json({
//       success: true,
//       message: `Vehicle parked successfully at ${result.slot.id}`,
//       data: result
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// }

// /**
//  * Exit a vehicle
//  */
// async function exitVehicle(req, res) {
//   try {
//     const { ticketId } = req.body;

//     const result = await releaseSlot(ticketId);

//     // Emit socket event
//     emitSlotReleased(result);
//     emitStatusUpdate(Parking.getStats());

//     res.status(200).json({
//       success: true,
//       message: result.message,
//       data: result
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       error: error.message
//     });
//   }
// }

// /**
//  * Get all parked vehicles
//  */
// function getParkedVehicles(req, res) {
//   try {
//     const tickets = Parking.getAllTickets();

//     res.status(200).json({
//       success: true,
//       count: tickets.length,
//       data: tickets
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// }

// /**
//  * Get all parking slots
//  */
// function getAllSlots(req, res) {
//   try {
//     const slots = Parking.getAllSlots().map((s) => s.toJSON());

//     res.status(200).json({
//       success: true,
//       count: slots.length,
//       data: slots
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// }

// /**
//  * Get parking statistics
//  */
// async function getStats(req, res) {
//   try {
//     const stats = Parking.getStats();

//     const gates = Object.keys(Parking.gates);
//     const vehicleTypes = ["car", "motorbike", "large"];

//     const availability = {};
//     for (const gate of gates) {
//       availability[gate] = {};
//       for (const type of vehicleTypes) {
//         availability[gate][type] = await getAvailableCount(gate, type);
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         ...stats,
//         availability
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// }

// export {
//   parkVehicle,
//   exitVehicle,
//   getParkedVehicles,
//   getAllSlots,
//   getStats
// };
