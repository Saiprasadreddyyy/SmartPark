class Parking {
  constructor() {
    this.gates = {
      gateA: { id: "gateA", coords: { x: 0, y: 0 } },
      gateB: { id: "gateB", coords: { x: 400, y: 0 } }
    };

    this.floors = []; // Array of floors with slots
    this.slots = {}; // Map of slotId -> Slot object
    this.tickets = {}; // Map of ticketId -> Ticket object
    this.distances = {}; // Map of slotId -> { gateId: distance }
  }

  reset() {
    this.floors = [];
    this.slots = {};
    this.tickets = {};
    this.distances = {};
  }

  addFloor(floorNumber, slots) {
    this.floors.push({
      number: floorNumber,
      slots: slots.map((s) => s.id)
    });

    slots.forEach((slot) => {
      this.slots[slot.id] = slot;
    });
  }

  getSlot(slotId) {
    return this.slots[slotId];
  }

  getAllSlots() {
    return Object.values(this.slots);
  }

  getAvailableSlots(vehicleType) {
    return Object.values(this.slots).filter(
      (slot) => !slot.occupied && slot.type === vehicleType
    );
  }

  addTicket(ticket) {
    this.tickets[ticket.id] = ticket;
  }

  getTicket(ticketId) {
    return this.tickets[ticketId];
  }

  getAllTickets() {
    return Object.values(this.tickets);
  }

  removeTicket(ticketId) {
    delete this.tickets[ticketId];
  }

  occupySlot(slotId, ticketId) {
    if (this.slots[slotId]) {
      this.slots[slotId].occupied = true;
      this.slots[slotId].currentTicket = ticketId;
    }
  }

  releaseSlot(slotId) {
    if (this.slots[slotId]) {
      this.slots[slotId].occupied = false;
      this.slots[slotId].currentTicket = null;
    }
  }

  setDistance(slotId, gateId, distance) {
    if (!this.distances[slotId]) {
      this.distances[slotId] = {};
    }
    this.distances[slotId][gateId] = distance;
  }

  getDistance(slotId, gateId) {
    return this.distances[slotId]?.[gateId] || 0;
  }

  getStats() {
    const allSlots = this.getAllSlots();
    const occupiedSlots = allSlots.filter((s) => s.occupied);

    return {
      totalSlots: allSlots.length,
      occupiedSlots: occupiedSlots.length,
      availableSlots: allSlots.length - occupiedSlots.length,
      totalFloors: this.floors.length,
      activeTickets: Object.keys(this.tickets).length
    };
  }
}

// Singleton instance
const parkingInstance = new Parking();

// Export default for consistent importing
export default parkingInstance;
