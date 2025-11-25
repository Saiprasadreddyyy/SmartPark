import { v4 as uuidv4 } from 'uuid';
import SlotModel from '../models/slot.model.js';
import TicketModel from '../models/ticket.model.js';
import { 
  getNearestSlot, 
  removeSlotFromAvailability 
} from './redisAvailability.service.js';

async function allocateSlot({ gateId, vehicleType, vehicleNumber, owner }) {
  // Validate input
  if (!gateId || !vehicleType || !vehicleNumber || !owner) {
    throw new Error('Missing required fields');
  }

  if (!['gateA', 'gateB'].includes(gateId)) {
    throw new Error(`Invalid gate: ${gateId}`);
  }

  // Get nearest available slot from Redis
  const result = await getNearestSlot(gateId, vehicleType);
  
  if (!result) {
    throw new Error(`No available ${vehicleType} slots`);
  }

  const { slotId, distance } = result;
  
  // Validate slot exists and is available in MongoDB
  const slot = await SlotModel.findOne({ id: slotId });
  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  if (slot.occupied) {
    throw new Error(`Slot ${slotId} is already occupied`);
  }

  // Create ticket
  const ticketId = uuidv4();
  const ticket = new TicketModel({
    id: ticketId,
    slotId,
    vehicleNumber: vehicleNumber.toUpperCase(),
    owner,
    gateId,
    vehicleType,
    timestamp: new Date(),
    status: 'active'
  });

  // Save ticket to MongoDB
  await ticket.save();
  
  // Update slot as occupied
  slot.occupied = true;
  slot.currentTicket = ticketId;
  await slot.save();
  
  // Remove from all Redis availability sets
  await removeSlotFromAvailability(slotId);

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
      timestamp: ticket.timestamp
    },
    distance: distance.toFixed(2)
  };
}

export { allocateSlot };
// import Parking from "../models/parking.model.js";
// import Ticket from "../models/ticket.model.js";
// import { 
//   getNearestSlot, 
//   removeSlotFromAvailability 
// } from "./redisAvailability.service.js";

// async function allocateSlot({ gateId, vehicleType, vehicleNumber, owner }) {
//   // Validate input
//   if (!gateId || !vehicleType || !vehicleNumber || !owner) {
//     throw new Error("Missing required fields");
//   }

//   if (!Parking.gates[gateId]) {
//     throw new Error(`Invalid gate: ${gateId}`);
//   }

//   // Get nearest available slot from Redis
//   const result = await getNearestSlot(gateId, vehicleType);

//   if (!result) {
//     throw new Error(`No available ${vehicleType} slots`);
//   }

//   const { slotId, distance } = result;

//   // Validate slot exists and is available
//   const slot = Parking.getSlot(slotId);
//   if (!slot) {
//     throw new Error(`Slot ${slotId} not found`);
//   }

//   if (slot.occupied) {
//     throw new Error(`Slot ${slotId} is already occupied`);
//   }

//   // Create ticket
//   const ticket = new Ticket({
//     slotId,
//     vehicleNumber,
//     owner,
//     gateId,
//     vehicleType
//   });

//   // Occupy slot
//   Parking.occupySlot(slotId, ticket.id);

//   // Add ticket to parking
//   Parking.addTicket(ticket);

//   // Remove from all Redis availability sets
//   await removeSlotFromAvailability(slotId);

//   return {
//     slot: slot.toJSON(),
//     ticket: ticket.toJSON(),
//     distance: distance.toFixed(2)
//   };
// }

// export { allocateSlot };
