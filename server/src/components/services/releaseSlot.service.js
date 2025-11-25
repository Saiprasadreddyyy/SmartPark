import SlotModel from '../models/slot.model.js';
import TicketModel from '../models/ticket.model.js';
import { addSlotToAvailability } from './redisAvailability.service.js';

async function releaseSlot(ticketId) {
  // Validate ticket exists
  const ticket = await TicketModel.findOne({ id: ticketId, status: 'active' });
  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found or already completed`);
  }

  const slotId = ticket.slotId;
  const slot = await SlotModel.findOne({ id: slotId });
  
  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  // Update ticket status
  ticket.status = 'completed';
  ticket.exitTime = new Date();
  await ticket.save();
  
  // Release slot
  slot.occupied = false;
  slot.currentTicket = null;
  await slot.save();
  
  // Add slot back to Redis availability
  await addSlotToAvailability(slotId);

  return {
    slot: {
      id: slot.id,
      floor: slot.floor,
      type: slot.type,
      coords: slot.coords,
      occupied: slot.occupied,
      currentTicket: slot.currentTicket
    },
    ticket: {
      id: ticket.id,
      slotId: ticket.slotId,
      vehicleNumber: ticket.vehicleNumber,
      owner: ticket.owner,
      gateId: ticket.gateId,
      vehicleType: ticket.vehicleType,
      timestamp: ticket.timestamp,
      exitTime: ticket.exitTime
    },
    message: `Vehicle ${ticket.vehicleNumber} exited successfully`
  };
}

export { releaseSlot };
// import Parking from "../models/parking.model.js";
// import { addSlotToAvailability } from "./redisAvailability.service.js";

// async function releaseSlot(ticketId) {
//   // Validate ticket exists
//   const ticket = Parking.getTicket(ticketId);
//   if (!ticket) {
//     throw new Error(`Ticket ${ticketId} not found`);
//   }

//   const slotId = ticket.slotId;
//   const slot = Parking.getSlot(slotId);

//   if (!slot) {
//     throw new Error(`Slot ${slotId} not found`);
//   }

//   // Release slot
//   Parking.releaseSlot(slotId);

//   // Remove ticket
//   Parking.removeTicket(ticketId);

//   // Add slot back to Redis availability
//   await addSlotToAvailability(slotId);

//   return {
//     slot: slot.toJSON(),
//     ticket: ticket,
//     message: `Vehicle ${ticket.vehicleNumber} exited successfully`
//   };
// }

// export { releaseSlot };
