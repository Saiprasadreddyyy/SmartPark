// server/components/services/redisAvailability.service.js
import redis, { isRedisConnected } from '../../config/redis.js';
import SlotModel from '../models/slot.model.js';
import DistanceModel from '../models/distance.model.js';

function getAvailabilityKey(gateId, vehicleType) {
  return `available:${gateId}:${vehicleType}`;
}

async function populateRedisAvailability() {
  // Skip if Redis is not available
  if (!isRedisConnected()) {
    console.log('⚠️ Redis not available, skipping availability population');
    return;
  }

  console.log('🔄 Populating Redis availability from MongoDB...');
  
  const gates = ['gateA', 'gateB'];
  const vehicleTypes = ['car', 'motorbike', 'large'];
  
  try {
    // Clear existing availability
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
    console.error('❌ Error populating Redis:', error.message);
    // Don't throw - let the system continue without Redis
  }
}

// Fallback: Get nearest slot from MongoDB if Redis fails
async function getNearestSlotFromDB(gateId, vehicleType) {
  console.log(`🔄 Using MongoDB fallback for ${gateId}/${vehicleType}`);
  
  try {
    // Find all available slots of this type
    const availableSlots = await SlotModel.find({ 
      type: vehicleType, 
      occupied: false 
    });
    
    if (availableSlots.length === 0) {
      return null;
    }
    
    // Find distances for these slots from this gate
    const slotIds = availableSlots.map(s => s.id);
    const distances = await DistanceModel.find({
      slotId: { $in: slotIds },
      gateId: gateId
    }).sort({ distance: 1 }).limit(1);
    
    if (distances.length === 0) {
      // If no distance data, just return first available slot
      return {
        slotId: availableSlots[0].id,
        distance: 0
      };
    }
    
    return {
      slotId: distances[0].slotId,
      distance: distances[0].distance
    };
  } catch (error) {
    console.error('❌ MongoDB fallback error:', error.message);
    throw error;
  }
}

async function getNearestSlot(gateId, vehicleType) {
  // Try Redis first
  if (isRedisConnected()) {
    try {
      const key = getAvailabilityKey(gateId, vehicleType);
      const result = await redis.zpopmin(key);
      
      if (!result || result.length === 0) {
        // No slots in Redis, fallback to DB
        return await getNearestSlotFromDB(gateId, vehicleType);
      }
      
      const slotId = result[0];
      const distance = parseFloat(result[1]);
      
      return { slotId, distance };
    } catch (error) {
      console.error('❌ Redis getNearestSlot error:', error.message);
      // Fallback to MongoDB
      return await getNearestSlotFromDB(gateId, vehicleType);
    }
  }
  
  // Redis not available, use MongoDB
  return await getNearestSlotFromDB(gateId, vehicleType);
}

async function removeSlotFromAvailability(slotId) {
  if (!isRedisConnected()) {
    return; // Skip if Redis not available
  }
  
  try {
    const slot = await SlotModel.findOne({ id: slotId });
    if (!slot) return;
    
    const gates = ['gateA', 'gateB'];
    const pipeline = redis.pipeline();
    
    gates.forEach(gateId => {
      const key = getAvailabilityKey(gateId, slot.type);
      pipeline.zrem(key, slotId);
    });
    
    await pipeline.exec();
  } catch (error) {
    console.error('❌ Redis removeSlotFromAvailability error:', error.message);
    // Continue without Redis
  }
}

async function addSlotToAvailability(slotId) {
  if (!isRedisConnected()) {
    return; // Skip if Redis not available
  }
  
  try {
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
  } catch (error) {
    console.error('❌ Redis addSlotToAvailability error:', error.message);
    // Continue without Redis
  }
}

async function getAvailableCount(gateId, vehicleType) {
  if (isRedisConnected()) {
    try {
      const key = getAvailabilityKey(gateId, vehicleType);
      return await redis.zcard(key);
    } catch (error) {
      console.error('❌ Redis getAvailableCount error:', error.message);
      // Fallback to MongoDB count
    }
  }
  
  // Fallback: Count from MongoDB
  try {
    return await SlotModel.countDocuments({ 
      type: vehicleType, 
      occupied: false 
    });
  } catch (error) {
    console.error('❌ MongoDB getAvailableCount error:', error.message);
    return 0;
  }
}

export {
  populateRedisAvailability,
  getNearestSlot,
  removeSlotFromAvailability,
  addSlotToAvailability,
  getAvailableCount
};