import SlotModel from '../components/models/slot.model.js';
import TicketModel from '../components/models/ticket.model.js';
import DistanceModel from '../components/models/distance.model.js';
import { populateRedisAvailability } from '../components/services/redisAvailability.service.js';

function calculateDistance(coords1, coords2) {
  return Math.sqrt(
    Math.pow(coords1.x - coords2.x, 2) + 
    Math.pow(coords1.y - coords2.y, 2)
  );
}

async function seedParking() {
  console.log('🌱 Starting parking lot database seeding...');
  
  try {
    // Clear existing data
    await SlotModel.deleteMany({});
    await TicketModel.deleteMany({});
    await DistanceModel.deleteMany({});
    console.log('✅ Cleared existing data');

    // Define gates
    const gates = {
      gateA: { id: 'gateA', coords: { x: 0, y: 0 } },
      gateB: { id: 'gateB', coords: { x: 400, y: 0 } }
    };

    // Floor 1: 8 slots (alternating car/motorbike)
    const floor1Slots = [];
    for (let i = 0; i < 8; i++) {
      floor1Slots.push({
        id: `F1-S${i + 1}`,
        floor: 1,
        type: i % 2 === 0 ? 'car' : 'motorbike',
        coords: {
          x: (i % 4) * 100,
          y: Math.floor(i / 4) * 100
        },
        occupied: false,
        currentTicket: null
      });
    }
    
    await SlotModel.insertMany(floor1Slots);
    console.log(`✅ Created Floor 1 with ${floor1Slots.length} slots`);

    // Floor 2: 10 slots (large every 3rd, rest car)
    const floor2Slots = [];
    for (let i = 0; i < 10; i++) {
      floor2Slots.push({
        id: `F2-S${i + 9}`,
        floor: 2,
        type: (i + 1) % 3 === 0 ? 'large' : 'car',
        coords: {
          x: (i % 5) * 100,
          y: Math.floor(i / 5) * 100 + 200
        },
        occupied: false,
        currentTicket: null
      });
    }
    
    await SlotModel.insertMany(floor2Slots);
    console.log(`✅ Created Floor 2 with ${floor2Slots.length} slots`);

    // Compute and store distances
    console.log('📏 Computing distances...');
    const allSlots = [...floor1Slots, ...floor2Slots];
    const distanceRecords = [];
    
    allSlots.forEach(slot => {
      Object.values(gates).forEach(gate => {
        const distance = calculateDistance(slot.coords, gate.coords);
        distanceRecords.push({
          slotId: slot.id,
          gateId: gate.id,
          distance: distance
        });
      });
    });
    
    await DistanceModel.insertMany(distanceRecords);
    console.log(`✅ Stored ${distanceRecords.length} distance records`);

    // Populate Redis with availability
    await populateRedisAvailability();
    
    // Print summary
    const slotCount = await SlotModel.countDocuments();
    const activeTickets = await TicketModel.countDocuments({ status: 'active' });
    
    console.log('\n📊 Parking Lot Summary:');
    console.log(`   Total Slots: ${slotCount}`);
    console.log(`   Floor 1: ${floor1Slots.length} slots`);
    console.log(`   Floor 2: ${floor2Slots.length} slots`);
    console.log(`   Active Tickets: ${activeTickets}`);
    console.log(`   Distance Records: ${distanceRecords.length}`);
    
    console.log('\n🎉 Database seeding completed!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

export { seedParking };

