
import SlotModel from "../components/models/slot.model.js";
import TicketModel from "../components/models/ticket.model.js";
import DistanceModel from "../components/models/distance.model.js";
import redis from "../config/redis.js";

function calculateDistance(c1, c2) {
  return Math.sqrt(Math.pow(c1.x - c2.x, 2) + Math.pow(c1.y - c2.y, 2));
}

import {
  populateRedisAvailability as populateRedis
} from "../components/services/redisAvailability.service.js";

export async function populateRedisAvailability() {
  await populateRedis();
}

export async function seedParking() {
  console.log("\n🌱 Starting parking lot seeding...");

  try {

    await SlotModel.deleteMany({});
    await TicketModel.deleteMany({});
    await DistanceModel.deleteMany({});
    console.log("🧹 Cleared old collections");


    const gates = {
      gateA: { id: "gateA", coords: { x: 0, y: 0 } },
      gateB: { id: "gateB", coords: { x: 400, y: 0 } },
    };

   
    const floor1Slots = [];
    for (let i = 0; i < 8; i++) {
      floor1Slots.push({
        id: `F1-S${i + 1}`,
        floor: 1,
        type: i % 2 === 0 ? "car" : "motorbike",
        coords: { x: (i % 4) * 100, y: Math.floor(i / 4) * 100 },
        occupied: false,
        currentTicket: null,
      });
    }
    await SlotModel.insertMany(floor1Slots);
    console.log(`🏢 Floor 1 created: ${floor1Slots.length} slots`);

    
    const floor2Slots = [];
    for (let i = 0; i < 10; i++) {
      floor2Slots.push({
        id: `F2-S${i + 9}`,
        floor: 2,
        type: (i + 1) % 3 === 0 ? "large" : "car",
        coords: { x: (i % 5) * 100, y: Math.floor(i / 5) * 100 + 200 },
        occupied: false,
        currentTicket: null,
      });
    }
    await SlotModel.insertMany(floor2Slots);
    console.log(`🏢 Floor 2 created: ${floor2Slots.length} slots`);

   
    console.log("📏 Calculating distance records...");
    const allSlots = [...floor1Slots, ...floor2Slots];
    const distanceRecords = [];

    for (const slot of allSlots) {
      for (const gate of Object.values(gates)) {
        distanceRecords.push({
          slotId: slot.id,
          gateId: gate.id,
          distance: calculateDistance(slot.coords, gate.coords),
        });
      }
    }

    await DistanceModel.insertMany(distanceRecords);
    console.log(`📚 Stored ${distanceRecords.length} distance records`);

    
    await populateRedisAvailability();

    const slotCount = await SlotModel.countDocuments();
    const activeTickets = await TicketModel.countDocuments({
      status: "active",
    });

    console.log("\n PARKING LOT SUMMARY");
    console.log(`➡ Total Slots: ${slotCount}`);
    console.log(`➡ Floor 1: ${floor1Slots.length}`);
    console.log(`➡ Floor 2: ${floor2Slots.length}`);
    console.log(`➡ Active Tickets: ${activeTickets}`);
    console.log(`➡ Distance Records: ${distanceRecords.length}`);
    console.log("\n Seeding Complete\n");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}
