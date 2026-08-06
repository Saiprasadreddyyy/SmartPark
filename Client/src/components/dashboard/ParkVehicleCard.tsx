import { useState } from "react";
import { ParkingCircle } from "lucide-react";
import api from "../../api/axios";

export default function ParkVehicleCard() {
  const [gateId, setGateId] = useState("gateA");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
const [vehicleNumber, setVehicleNumber] = useState("");

  async function handlePark(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const { data } = await api.post("/user/park", {
        gateId,
        vehicleType,
        vehicleNumber,
      });

      setMessage(data.message);

    } catch (err: any) {
      setMessage(
        err.response?.data?.message ||
        "Unable to park vehicle."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style ={{marginLeft:"320px",marginTop:"120px"}} className=" h-120  w-200 rounded-2xl border border-green-900/40 bg-[#0D1612] p-8">

      <div className="flex items-center gap-50">

        <ParkingCircle
        style={{margin:"30px"}}
          size={30}
          className="text-emerald-400"
        />

        <div>

          <h2 className="text-2xl font-bold text-white">
            Park Vehicle
          </h2>

          <p className="text-gray-400">
            Allocate nearest available slot
          </p>

        </div>

      </div>

      {message && (
        <div  className="mt-6 rounded-xl bg-green-500/10 border border-green-700 p-4 text-emerald-300">
          {message}
        </div>
      )}

      <form
      style={{margin:"40px"}}
        onSubmit={handlePark}
        className="mt-8 space-y-6"
      >

        <div>

          <label style ={{marginLeft:"90px",marginBottom:"10px"}} className="mb-2 block text-gray-400">
            Select Gate
          </label>

          <select
            style ={{marginLeft:"90px",marginBottom:"20px"}}
            value={gateId}
            onChange={(e) => setGateId(e.target.value)}
            className="w-80 rounded-2xl border border-green-900 bg-[#10261D] px-5 py-3 text-white"
          >
            <option value="gateA">Gate A</option>
            <option value="gateB">Gate B</option>
          </select>

        </div>
        <div>
  <label style ={{marginLeft:"90px",marginBottom:"10px"}} className="mb-2 block text-gray-400">
    Vehicle Type
  </label>

  <select
  style ={{marginLeft:"90px",marginBottom:"20px"}}
    value={vehicleType}
    onChange={(e) => setVehicleType(e.target.value)}
    className="w-80 rounded-2xl border border-green-900 bg-[#10261D] px-5 py-3 text-white"
  >
    <option value="car">Car</option>
    <option value="motorbike">Motorbike</option>
    <option value="large">Large</option>
  </select>
</div>
<div>
  <label style ={{marginLeft:"90px",marginBottom:"10px"}} className="mb-2 block text-gray-400">
    Vehicle Number
  </label>

  <input
  style ={{marginLeft:"90px",marginBottom:"40px"}}
    type="text"
    value={vehicleNumber}
    onChange={(e) => setVehicleNumber(e.target.value)}
    className="w-80 rounded-2xl border border-green-900 bg-[#10261D] px-5 py-3 text-white"
    placeholder="AP39AB1234"
  />
</div>

        <button
        style ={{marginLeft:"170px"}}
          disabled={loading}
          className="w-90 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-600 py-4 font-bold text-black"
        >
          {loading ? "Allocating..." : "Park Vehicle"}
        </button>

      </form>

    </section>
  );
}