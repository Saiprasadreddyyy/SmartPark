import redis from '../../config/redis.js';
import SlotModel from '../models/slot.model.js';
import DistanceModel from '../models/distance.model.js';

/**
 * Get Redis key for availability sorted set
 */
function getAvailabilityKey(gateId, vehicleType) {
  return `available:${gateId}:${vehicleType}`;
}

/**
 * Populate Redis with all available slots from MongoDB
 */
async function populateRedisAvailability() {
  console.log('🔄 Populating Redis availability from MongoDB...');
  
  const gates = ['gateA', 'gateB'];
  const vehicleTypes = ['car', 'motorbike', 'large'];
  
  try {
    // Clear existing keys
    const pipeline = redis.pipeline();
    gates.forEach(gateId => {
      vehicleTypes.forEach(vehicleType => {
        const key = getAvailabilityKey(gateId, vehicleType);
        pipeline.del(key);
      });
    });
    await pipeline.exec();
    
    // Get all available slots from MongoDB
    const allSlots = await SlotModel.find({ occupied: false });
    const addPipeline = redis.pipeline();
    
    // For each slot, add to Redis sorted sets
    for (const slot of allSlots) {
      for (const gateId of gates) {
        const key = getAvailabilityKey(gateId, slot.type);
        
        // Get distance from MongoDB
        const distanceDoc = await DistanceModel.findOne({ slotId: slot.id, gateId });
        if (distanceDoc) {
          addPipeline.zadd(key, distanceDoc.distance, slot.id);
        }
      }
    }
    
    await addPipeline.exec();
    console.log('✅ Redis availability populated from MongoDB');
  } catch (error) {
    console.error('❌ Error populating Redis:', error);
    throw error;
  }
}

/**
 * Get nearest available slot for a gate and vehicle type
 */
async function getNearestSlot(gateId, vehicleType) {
  const key = getAvailabilityKey(gateId, vehicleType);
  const result = await redis.zpopmin(key);
  
  if (!result || result.length === 0) {
    return null;
  }
  
  const slotId = result[0];
  const distance = parseFloat(result[1]);
  
  return { slotId, distance };
}

/**
 * Remove slot from all availability sets
 */
async function removeSlotFromAvailability(slotId) {
  const slot = await SlotModel.findOne({ id: slotId });
  if (!slot) return;
  
  const gates = ['gateA', 'gateB'];
  const pipeline = redis.pipeline();
  
  gates.forEach(gateId => {
    const key = getAvailabilityKey(gateId, slot.type);
    pipeline.zrem(key, slotId);
  });
  
  await pipeline.exec();
}

/**
 * Add slot back to availability sets
 */
async function addSlotToAvailability(slotId) {
  const slot = await SlotModel.findOne({ id: slotId });
  if (!slot || slot.occupied) return;
  
  const gates = ['gateA', 'gateB'];
  const pipeline = redis.pipeline();
  
  for (const gateId of gates) {
    const key = getAvailabilityKey(gateId, slot.type);
    
    // Get distance from MongoDB
    const distanceDoc = await DistanceModel.findOne({ slotId, gateId });
    if (distanceDoc) {
      pipeline.zadd(key, distanceDoc.distance, slotId);
    }
  }
  
  await pipeline.exec();
}

/**
 * Get available slot count for a gate and vehicle type
 */
async function getAvailableCount(gateId, vehicleType) {
  const key = getAvailabilityKey(gateId, vehicleType);
  return await redis.zcard(key);
}

export {
  populateRedisAvailability,
  getNearestSlot,
  removeSlotFromAvailability,
  addSlotToAvailability,
  getAvailableCount
};

// import redis from "../../config/redis.js";
// import Parking from "../models/parking.model.js";

// /**
//  * Get Redis key for availability sorted set
//  */
// function getAvailabilityKey(gateId, vehicleType) {
//   return `available:${gateId}:${vehicleType}`;
// }

// /**
//  * Populate Redis with all available slots
//  */
// async function populateRedisAvailability() {
//   console.log("🔄 Populating Redis availability...");

//   const gates = Object.keys(Parking.gates);
//   const vehicleTypes = ["car", "motorbike", "large"];

//   // Clear existing keys
//   const pipeline = redis.pipeline();
//   gates.forEach(gateId => {
//     vehicleTypes.forEach(vehicleType => {
//       const key = getAvailabilityKey(gateId, vehicleType);
//       pipeline.del(key);
//     });
//   });
//   await pipeline.exec();

//   // Add all available slots
//   const allSlots = Parking.getAllSlots();
//   const addPipeline = redis.pipeline();

//   allSlots.forEach(slot => {
//     if (!slot.occupied) {
//       gates.forEach(gateId => {
//         const key = getAvailabilityKey(gateId, slot.type);
//         const distance = Parking.getDistance(slot.id, gateId);
//         addPipeline.zadd(key, distance, slot.id);
//       });
//     }
//   });

//   await addPipeline.exec();
//   console.log("✅ Redis availability populated");
// }

// /**
//  * Get nearest available slot for a gate and vehicle type
//  */
// async function getNearestSlot(gateId, vehicleType) {
//   const key = getAvailabilityKey(gateId, vehicleType);
//   const result = await redis.zpopmin(key);

//   if (!result || result.length === 0) {
//     return null;
//   }

//   const slotId = result[0];
//   const distance = parseFloat(result[1]);

//   return { slotId, distance };
// }

// /**
//  * Remove slot from all availability sets
//  */
// async function removeSlotFromAvailability(slotId) {
//   const slot = Parking.getSlot(slotId);
//   if (!slot) return;

//   const gates = Object.keys(Parking.gates);
//   const pipeline = redis.pipeline();

//   gates.forEach(gateId => {
//     const key = getAvailabilityKey(gateId, slot.type);
//     pipeline.zrem(key, slotId);
//   });

//   await pipeline.exec();
// }

// /**
//  * Add slot back to availability sets
//  */
// async function addSlotToAvailability(slotId) {
//   const slot = Parking.getSlot(slotId);
//   if (!slot || slot.occupied) return;

//   const gates = Object.keys(Parking.gates);
//   const pipeline = redis.pipeline();

//   gates.forEach(gateId => {
//     const key = getAvailabilityKey(gateId, slot.type);
//     const distance = Parking.getDistance(slotId, gateId);
//     pipeline.zadd(key, distance, slotId);
//   });

//   await pipeline.exec();
// }

// /**
//  * Get available slot count for a gate and vehicle type
//  */
// async function getAvailableCount(gateId, vehicleType) {
//   const key = getAvailabilityKey(gateId, vehicleType);
//   return await redis.zcard(key);
// }

// export {
//   populateRedisAvailability,
//   getNearestSlot,
//   removeSlotFromAvailability,
//   addSlotToAvailability,
//   getAvailableCount
// };
