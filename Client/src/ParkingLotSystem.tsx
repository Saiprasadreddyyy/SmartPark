// src/ParkingLotSystem.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Car, Bike, Truck } from "lucide-react";

// Backend URL
const API_BASE = "http://localhost:5050/api/parking";

// Type definitions
interface Slot {
  id: string;
  type: "car" | "motorbike" | "large";
  occupied: boolean;
  currentTicket: string | null;
  floor: number;
}

interface Vehicle {
  id: string; // ticket ID
  slotId: string;
  vehicleType: "car" | "motorbike" | "large";
  vehicleNumber: string;
  owner: string;
  gateId: string;
  timestamp: string;
}

interface FormData {
  gateId: "gateA" | "gateB";
  vehicleType: "car" | "motorbike" | "large";
  vehicleNumber: string;
  owner: string;
}

const ParkingLotSystem: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [parkedVehicles, setParkedVehicles] = useState<Vehicle[]>([]);
  const [formData, setFormData] = useState<FormData>({
    gateId: "gateA",
    vehicleType: "car",
    vehicleNumber: "",
    owner: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch slots and vehicles on load
  useEffect(() => {
    fetchSlots();
    fetchParkedVehicles();
    
    // Refresh data every 2 seconds
    const interval = setInterval(() => {
      fetchSlots();
      fetchParkedVehicles();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  /** Fetch all slots */
  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/slots`);
      console.log("✅ Slots response:", data);
      
      if (data.success && data.data) {
        setSlots(data.data);
      }
    } catch (err: any) {
      console.error("❌ Error fetching slots:", err);
      if (slots.length === 0) {
        setMessage("⚠️ Cannot connect to backend. Check if server is running on port 5050");
      }
    }
  };

  /** Fetch all parked vehicles */
  const fetchParkedVehicles = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/vehicles`);
      console.log("✅ Vehicles response:", data);
      
      if (data.success && data.data) {
        // Map backend tickets to frontend vehicles
        const vehicles = data.data.map((ticket: any) => ({
          id: ticket.id,
          slotId: ticket.slotId,
          vehicleType: ticket.vehicleType,
          vehicleNumber: ticket.vehicleNumber,
          owner: ticket.owner,
          gateId: ticket.gateId,
          timestamp: ticket.timestamp
        }));
        setParkedVehicles(vehicles);
      }
    } catch (err: any) {
      console.error("❌ Error fetching vehicles:", err);
    }
  };

  /** Park a vehicle */
  const handleParkVehicle = async () => {
    if (!formData.vehicleNumber || !formData.owner) {
      setMessage("❌ Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      console.log("🚗 Parking request:", formData);
      
      const response = await axios.post(`${API_BASE}/park`, formData);
      console.log("✅ Park response:", response.data);

      if (!response.data.success) {
        setMessage(`❌ ${response.data.message || response.data.error || "Failed to park vehicle"}`);
        setLoading(false);
        return;
      }

      const result = response.data.data;
      
      // Backend returns: { slot, ticket, distance }
      const ticket = result.ticket;
      const slot = result.slot;
      const distance = result.distance;

      setMessage(`✅ ${response.data.message} - Distance: ${distance}m`);
      setFormData({ ...formData, vehicleNumber: "", owner: "" });
      
      // Refresh data immediately
      await fetchSlots();
      await fetchParkedVehicles();
      
    } catch (err: any) {
      console.error("❌ Error parking vehicle:", err);
      console.error("Error details:", err.response?.data);
      
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Unknown error";
      setMessage(`❌ Error: ${errorMsg}`);
    }
    setLoading(false);
  };

  /** Exit a vehicle */
  const handleExitVehicle = async (ticketId: string) => {
    try {
      console.log("🚪 Exit request for ticket:", ticketId);
      
      const response = await axios.post(`${API_BASE}/exit`, { ticketId });
      console.log("✅ Exit response:", response.data);

      if (!response.data.success) {
        setMessage(`❌ ${response.data.error || "Failed to exit vehicle"}`);
        return;
      }

      setMessage(`✅ ${response.data.message}`);
      
      // Refresh data immediately
      await fetchSlots();
      await fetchParkedVehicles();
      
    } catch (err: any) {
      console.error("❌ Error exiting vehicle:", err);
      const errorMsg = err.response?.data?.error || err.message;
      setMessage(`❌ Error: ${errorMsg}`);
    }
  };

  /** Slot color based on occupancy */
  const getSlotColor = (slot: Slot) =>
    slot.occupied ? "bg-red-500" : "bg-green-500";

  /** Vehicle icon based on type */
  const getVehicleIcon = (type: Slot["type"]) => {
    switch (type) {
      case "car":
        return <Car size={16} />;
      case "motorbike":
        return <Bike size={16} />;
      case "large":
        return <Truck size={16} />;
      default:
        return <Car size={16} />;
    }
  };

  /** Format gate name */
  const formatGateName = (gateId: string) => {
    if (!gateId) return "Unknown Gate";
    return gateId === "gateA" ? "Gate A" : "Gate B";
  };

  /** Format date safely */
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      console.error("Date format error:", err);
      return "Invalid Date";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          🚗 Smart Parking Lot
        </h1>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('❌') ? 'bg-red-600' : 'bg-blue-600'
          } text-white`}>
            {message}
          </div>
        )}

        {/* Park Vehicle Form */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl mb-4 text-white">Park a Vehicle</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.gateId}
              onChange={(e) =>
                setFormData({ ...formData, gateId: e.target.value as any })
              }
              className="p-2 rounded bg-gray-700 text-white"
            >
              <option value="gateA">Gate A</option>
              <option value="gateB">Gate B</option>
            </select>
            <select
              value={formData.vehicleType}
              onChange={(e) =>
                setFormData({ ...formData, vehicleType: e.target.value as any })
              }
              className="p-2 rounded bg-gray-700 text-white"
            >
              <option value="car">Car</option>
              <option value="motorbike">Motorbike</option>
              <option value="large">Truck / Large</option>
            </select>
            <input
              type="text"
              placeholder="Vehicle Number (e.g., MH13CS4545)"
              value={formData.vehicleNumber}
              onChange={(e) =>
                setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })
              }
              className="p-2 rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="Owner Name"
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
              className="p-2 rounded bg-gray-700 text-white"
            />
          </div>
          <button
            onClick={handleParkVehicle}
            disabled={loading}
            className="mt-4 bg-green-600 text-white p-2 rounded hover:bg-green-500 disabled:opacity-50"
          >
            {loading ? "Parking..." : "Park Vehicle"}
          </button>
        </div>

        {/* Parked Vehicles */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl mb-4 text-white">
            Parked Vehicles ({parkedVehicles.length})
          </h2>
          {parkedVehicles.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No vehicles parked yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parkedVehicles.map((v) => (
                <div
                  key={v.id}
                  className="bg-gray-700 p-4 rounded flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg">{v.vehicleNumber}</div>
                    <div className="text-gray-300 text-sm mt-1">
                      👤 {v.owner || "Unknown"}
                    </div>
                    <div className="text-gray-300 text-sm mt-1">
                      📍 Slot: <span className="font-semibold">{v.slotId || "N/A"}</span>
                    </div>
                    <div className="text-gray-300 text-sm mt-1">
                      🚪 {formatGateName(v.gateId)}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      🕒 {formatDate(v.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleExitVehicle(v.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-500 ml-2"
                  >
                    Exit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parking Slot Status */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl mb-4 text-white">Parking Slots ({slots.length})</h2>
          {slots.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Loading slots... Make sure backend is running on port 5050!
            </p>
          ) : (
            <>
              {/* Floor 1 */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Floor 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {slots.filter(s => s.floor === 1).map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded flex items-center justify-between ${getSlotColor(
                        slot
                      )} text-white transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(slot.type)}
                        <span className="font-semibold">{slot.id}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {slot.occupied ? "🔴 Occupied" : "🟢 Free"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floor 2 */}
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Floor 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {slots.filter(s => s.floor === 2).map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded flex items-center justify-between ${getSlotColor(
                        slot
                      )} text-white transition-all`}
                    >
                      <div className="flex items-center gap-2">
                        {getVehicleIcon(slot.type)}
                        <span className="font-semibold">{slot.id}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {slot.occupied ? "🔴 Occupied" : "🟢 Free"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingLotSystem;

// // src/ParkingLotSystem.tsx
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Car, Bike, Truck } from "lucide-react";

// // Backend URL
// const API_BASE = "http://localhost:5050/api/parking";

// // Type definitions
// interface Slot {
//   id: string;
//   type: "car" | "motorbike" | "large";
//   occupied: boolean;
//   currentTicket: string | null;
// }

// interface Vehicle {
//   ticketId: string;
//   slotId: string;
//   vehicleType: "car" | "motorbike" | "large";
//   vehicleNumber: string;
//   owner: string;
//   gateId: string;
//   timestamp: string;
// }

// interface FormData {
//   gateId: "gateA" | "gateB";
//   vehicleType: "car" | "motorbike" | "large";
//   vehicleNumber: string;
//   owner: string;
// }

// const ParkingLotSystem: React.FC = () => {
//   const [slots, setSlots] = useState<Slot[]>([]);
//   const [parkedVehicles, setParkedVehicles] = useState<Vehicle[]>([]);
//   const [formData, setFormData] = useState<FormData>({
//     gateId: "gateA",
//     vehicleType: "car",
//     vehicleNumber: "",
//     owner: "",
//   });
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Fetch slots and vehicles on load
//   useEffect(() => {
//     fetchSlots();
//     fetchParkedVehicles();
//   }, []);

//   /** Fetch all slots */
//   const fetchSlots = async () => {
//     try {
//       const { data } = await axios.get(`${API_BASE}/slots`);
//       setSlots(data.data); // backend wraps array in data.data
//     } catch (err: any) {
//       console.error("Error fetching slots:", err.message);
//       setMessage("Failed to fetch slots");
//     }
//   };

//   /** Fetch all parked vehicles */
//   const fetchParkedVehicles = async () => {
//     try {
//       const { data } = await axios.get(`${API_BASE}/vehicles`);
//       setParkedVehicles(data.data);
//     } catch (err: any) {
//       console.error("Error fetching vehicles:", err.message);
//       setMessage("Failed to fetch parked vehicles");
//     }
//   };

//   /** Park a vehicle */
//   const handleParkVehicle = async () => {
//     if (!formData.vehicleNumber || !formData.owner) {
//       setMessage("Please fill all fields");
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data } = await axios.post(`${API_BASE}/park`, formData);

//       if (!data.success) {
//         setMessage(data.message || "Failed to park vehicle");
//         setLoading(false);
//         return;
//       }

//       const parked = data.data; // vehicle object
//       setParkedVehicles((prev) => [...prev, parked]);
//       setSlots((prev) =>
//         prev.map((slot) =>
//           slot.id === parked.slotId
//             ? { ...slot, occupied: true, currentTicket: parked.ticketId }
//             : slot
//         )
//       );

//       setMessage(`✅ Vehicle parked at ${parked.slotId}`);
//       setFormData({ ...formData, vehicleNumber: "", owner: "" });
//     } catch (err: any) {
//       console.error("Error parking vehicle:", err.message);
//       setMessage("Error parking vehicle");
//     }
//     setLoading(false);
//   };

//   /** Exit a vehicle */
//   const handleExitVehicle = async (ticketId: string) => {
//     try {
//       const { data } = await axios.post(`${API_BASE}/release`, { ticketId });

//       if (!data.success || !data.data?.slotId) return;

//       const slotId = data.data.slotId;
//       setParkedVehicles((prev) => prev.filter((v) => v.ticketId !== ticketId));
//       setSlots((prev) =>
//         prev.map((slot) =>
//           slot.id === slotId
//             ? { ...slot, occupied: false, currentTicket: null }
//             : slot
//         )
//       );

//       setMessage(`✅ Vehicle exited from ${slotId}`);
//     } catch (err: any) {
//       console.error("Error exiting vehicle:", err.message);
//       setMessage("Error exiting vehicle");
//     }
//   };

//   /** Slot color based on occupancy */
//   const getSlotColor = (slot: Slot) =>
//     slot.occupied ? "bg-red-500" : "bg-green-500";

//   /** Vehicle icon based on type */
//   const getVehicleIcon = (type: Slot["type"]) => {
//     switch (type) {
//       case "car":
//         return <Car size={16} />;
//       case "motorbike":
//         return <Bike size={16} />;
//       case "large":
//         return <Truck size={16} />;
//       default:
//         return <Car size={16} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-900 p-8">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-4xl font-bold text-center mb-8 text-white">
//           🚗 Smart Parking Lot
//         </h1>

//         {/* Message */}
//         {message && (
//           <div className="mb-4 p-3 bg-blue-600 text-white rounded">{message}</div>
//         )}

//         {/* Park Vehicle Form */}
//         <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
//           <h2 className="text-2xl mb-4 text-white">Park a Vehicle</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <select
//               value={formData.gateId}
//               onChange={(e) =>
//                 setFormData({ ...formData, gateId: e.target.value as any })
//               }
//               className="p-2 rounded bg-gray-700 text-white"
//             >
//               <option value="gateA">Gate A</option>
//               <option value="gateB">Gate B</option>
//             </select>
//             <select
//               value={formData.vehicleType}
//               onChange={(e) =>
//                 setFormData({ ...formData, vehicleType: e.target.value as any })
//               }
//               className="p-2 rounded bg-gray-700 text-white"
//             >
//               <option value="car">Car</option>
//               <option value="motorbike">Motorbike</option>
//               <option value="large">Truck / Large</option>
//             </select>
//             <input
//               type="text"
//               placeholder="Vehicle Number"
//               value={formData.vehicleNumber}
//               onChange={(e) =>
//                 setFormData({ ...formData, vehicleNumber: e.target.value })
//               }
//               className="p-2 rounded bg-gray-700 text-white"
//             />
//             <input
//               type="text"
//               placeholder="Owner Name"
//               value={formData.owner}
//               onChange={(e) =>
//                 setFormData({ ...formData, owner: e.target.value })
//               }
//               className="p-2 rounded bg-gray-700 text-white"
//             />
//           </div>
//           <button
//             onClick={handleParkVehicle}
//             disabled={loading}
//             className="mt-4 bg-green-600 text-white p-2 rounded hover:bg-green-500"
//           >
//             {loading ? "Parking..." : "Park Vehicle"}
//           </button>
//         </div>

//         {/* Parked Vehicles */}
//         <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
//           <h2 className="text-2xl mb-4 text-white">Parked Vehicles</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//             {parkedVehicles.map((v) => (
//               <div
//                 key={v.ticketId}
//                 className="bg-gray-700 p-4 rounded flex justify-between items-center"
//               >
//                 <div>
//                   <div className="text-white font-bold">{v.vehicleNumber}</div>
//                   <div className="text-gray-300 text-sm">{v.owner}</div>
//                   <div className="text-gray-300 text-sm">
//                     Slot: {v.slotId} | Gate: {v.gateId}
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => handleExitVehicle(v.ticketId)}
//                   className="bg-red-600 text-white p-1 rounded hover:bg-red-500"
//                 >
//                   Exit
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Parking Slot Status */}
//         <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
//           <h2 className="text-2xl mb-4 text-white">Parking Slots</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {slots.map((slot) => (
//               <div
//                 key={slot.id}
//                 className={`p-4 rounded flex items-center justify-between ${getSlotColor(
//                   slot
//                 )} text-white`}
//               >
//                 <div className="flex items-center gap-2">
//                   {getVehicleIcon(slot.type)}
//                   <span>{slot.id}</span>
//                 </div>
//                 <span>{slot.occupied ? "Occupied" : "Free"}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ParkingLotSystem;