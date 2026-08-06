import { v4 as uuidv4 } from 'uuid';
import SlotModel from '../models/slot.model.js';
import TicketModel from '../models/ticket.model.js';
import { getNearestSlot, removeSlotFromAvailability } from './redisAvailability.service.js';
import { emitSlotAllocated } from "../sockets/parking.socket.js";

async function allocateSlot({ gateId, vehicleType, vehicleNumber, owner ,userId}) {

  if (!gateId || !vehicleType || !vehicleNumber || !owner) {
    throw new Error('Missing required fields');
  }

  if (!['gateA', 'gateB'].includes(gateId)) {
    throw new Error(`Invalid gate: ${gateId}`);
  }


  const result = await getNearestSlot(gateId, vehicleType);
  
  if (!result) {
    throw new Error(`No available ${vehicleType} slots`);
  }

  const { slotId, distance } = result;
  

  const slot = await SlotModel.findOne({ id: slotId });
  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  if (slot.occupied) {
    throw new Error(`Slot ${slotId} is already occupied`);
  }


  const ticketId = uuidv4();
  const ticket = new TicketModel({
    id: ticketId,
    userId,
    slotId,
    vehicleNumber: vehicleNumber.toUpperCase(),
    owner,
    gateId,
    vehicleType,
    timestamp: new Date(),
    status: 'active'
  });


  await ticket.save();
  

  slot.occupied = true;
  slot.currentTicket = ticketId;
  await slot.save();
  

  await removeSlotFromAvailability(slotId);
  emitSlotAllocated({
    slotId: slot.id,
    vehicleType: slot.type,
    gateId
});

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
