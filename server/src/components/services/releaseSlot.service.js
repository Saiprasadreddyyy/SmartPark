import SlotModel from '../models/slot.model.js';
import TicketModel from '../models/ticket.model.js';
import { addSlotToAvailability } from './redisAvailability.service.js';
import { generateBill } from './billing.service.js';

async function releaseSlot(ticketId) {

  const ticket = await TicketModel.findOne({ id: ticketId, status: 'active' });
  if (!ticket) {
    throw new Error(`Ticket ${ticketId} not found or already completed`);
  }

  const slotId = ticket.slotId;
  const slot = await SlotModel.findOne({ id: slotId });
  
  if (!slot) {
    throw new Error(`Slot ${slotId} not found`);
  }

  const billingResult = await generateBill(ticketId);

  ticket.status = 'completed';
  ticket.exitTime = new Date();
  await ticket.save();
  
  slot.occupied = false;
  slot.currentTicket = null;
  await slot.save();
  
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
    bill: billingResult.bill,
    message: `Vehicle ${ticket.vehicleNumber} exited successfully. ${billingResult.message}`
  };
}

export { releaseSlot };