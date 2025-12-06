
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Car, Bike, Truck } from "lucide-react";
import PaymentModal from "./components/PaymentModal";


const API_BASE = import.meta.env.VITE_API_BASE;


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
  

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentBill, setCurrentBill] = useState<any>(null);

  useEffect(() => {
    fetchSlots();
    fetchParkedVehicles();
    
    const interval = setInterval(() => {
      fetchSlots();
      fetchParkedVehicles();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

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

  const fetchParkedVehicles = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/vehicles`);
      console.log("✅ Vehicles response:", data);
      
      if (data.success && data.data) {
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
      
      const ticket = result.ticket;
      const slot = result.slot;
      const distance = result.distance;

      setMessage(`✅ ${response.data.message} - Distance: ${distance}m`);
      setFormData({ ...formData, vehicleNumber: "", owner: "" });
      
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

  const handleExitVehicle = async (ticketId: string) => {
    try {
      console.log("🚪 Exit request for ticket:", ticketId);
      
      const response = await axios.post(`${API_BASE}/exit`, { ticketId });
      console.log("✅ Exit response:", response.data);

      if (!response.data.success) {
        setMessage(`❌ ${response.data.error || "Failed to exit vehicle"}`);
        return;
      }

      if (response.data.data && response.data.data.bill) {
        setCurrentBill(response.data.data.bill);
        setShowPaymentModal(true);
      } else {
        setMessage(`✅ ${response.data.message}`);
        await fetchSlots();
        await fetchParkedVehicles();
      }
      
    } catch (err: any) {
      console.error("❌ Error exiting vehicle:", err);
      const errorMsg = err.response?.data?.error || err.message;
      setMessage(`❌ Error: ${errorMsg}`);
    }
  };

  const handlePaymentSuccess = async (paidBill: any) => {
    setMessage(`✅ Payment successful! Vehicle ${paidBill.vehicleNumber} exited. Total: ₹${paidBill.totalAmount}`);
    setShowPaymentModal(false);
    setCurrentBill(null);
    
    await fetchSlots();
    await fetchParkedVehicles();
  };

  const handlePaymentModalClose = async () => {
    setShowPaymentModal(false);
    setCurrentBill(null);
    
    await fetchSlots();
    await fetchParkedVehicles();
  };

  const getSlotColor = (slot: Slot) =>
    slot.occupied ? "bg-red-500" : "bg-green-500";

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

  const formatGateName = (gateId: string) => {
    if (!gateId) return "Unknown Gate";
    return gateId === "gateA" ? "Gate A" : "Gate B";
  };

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

        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('❌') ? 'bg-red-600' : 
            message.includes('✅') && message.includes('Payment') ? 'bg-green-600' :
            'bg-blue-600'
          } text-white`}>
            {message}
          </div>
        )}

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
          
          <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
            <h3 className="text-sm font-semibold text-green-400 mb-2">💰 Parking Rates (per hour):</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-gray-300">
                <span className="text-green-400">🚗</span> Car: <strong className="text-white">₹40</strong>
              </div>
              <div className="text-gray-300">
                <span className="text-green-400">🏍️</span> Bike: <strong className="text-white">₹30</strong>
              </div>
              <div className="text-gray-300">
                <span className="text-green-400">🚛</span> Large: <strong className="text-white">₹60</strong>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">* GST (18%) applicable. Minimum charge: 1 hour</p>
          </div>
        </div>

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
                  className="bg-gray-700 p-4 rounded flex justify-between items-center hover:bg-gray-600 transition-all"
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
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-500 ml-2 font-semibold transition-all"
                  >
                    Exit & Pay
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-2xl mb-4 text-white">Parking Slots ({slots.length})</h2>
          {slots.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Loading slots... Make sure backend is running on port 5050!
            </p>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Floor 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {slots.filter(s => s.floor === 1).map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded flex items-center justify-between ${getSlotColor(
                        slot
                      )} text-white transition-all hover:scale-105`}
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

              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Floor 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {slots.filter(s => s.floor === 2).map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded flex items-center justify-between ${getSlotColor(
                        slot
                      )} text-white transition-all hover:scale-105`}
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

      {showPaymentModal && currentBill && (
        <PaymentModal
          bill={currentBill}
          onClose={handlePaymentModalClose}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default ParkingLotSystem;