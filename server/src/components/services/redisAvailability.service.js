import redis from '../../config/redis.js';
import SlotModel from '../models/slot.model.js';
import DistanceModel from '../models/distance.model.js';

function getAvailabilityKey(gateId, vehicleType) {
  return `available:${gateId}:${vehicleType}`;
}
async function populateRedisAvailability() {
  console.log('🔄 Populating Redis availability from MongoDB...');
  
  const gates = ['gateA', 'gateB'];
  const vehicleTypes = ['car', 'motorbike', 'large'];
  
  try {

    const pipeline = redis.pipeline();
    gates.forEach(gateId => {
      vehicleTypes.forEach(vehicleType => {
        const key = getAvailabilityKey(gateId, vehicleType);
        pipeline.del(key);
      });
    });
    await pipeline.exec();
    
    const allSlots = await SlotModel.find({ occupied: false });
    const addPipeline = redis.pipeline();
    
    for (const slot of allSlots) {
      for (const gateId of gates) {
        const key = getAvailabilityKey(gateId, slot.type);
        
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

async function addSlotToAvailability(slotId) {
  const slot = await SlotModel.findOne({ id: slotId });
  if (!slot || slot.occupied) return;
  
  const gates = ['gateA', 'gateB'];
  const pipeline = redis.pipeline();
  
  for (const gateId of gates) {
    const key = getAvailabilityKey(gateId, slot.type);
    

    const distanceDoc = await DistanceModel.findOne({ slotId, gateId });
    if (distanceDoc) {
      pipeline.zadd(key, distanceDoc.distance, slotId);
    }
  }
  
  await pipeline.exec();
}

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
