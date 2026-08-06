import { useEffect, useState } from "react";
import {
  User,
  Car,
  Bike,
  Truck,
  Receipt,
} from "lucide-react";

import api from "../../api/axios";
import socket from "../../socket/socket";

interface Ticket {
  _id: string;
  id: string;
  owner: string;
  vehicleNumber: string;
  vehicleType: "car" | "motorbike" | "large";
  slotId: string;
  gateId: string;
  timestamp: string;
}

interface Props {
  onGenerateBill: (
    ticketId: string
  ) => void | Promise<void>;
}

export default function ActiveVehicles({
  onGenerateBill,
}: Props) {
  const [vehicles, setVehicles] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  async function fetchVehicles() {
    try {
      const { data } = await api.get("/admin/vehicles");
      setVehicles(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVehicles();

    socket.on("slotAllocated", fetchVehicles);
    socket.on("slotReleased", fetchVehicles);

    return () => {
      socket.off("slotAllocated", fetchVehicles);
      socket.off("slotReleased", fetchVehicles);
    };
  }, []);

  async function handleGenerateBill(ticketId: string) {
    try {
      setGenerating(ticketId);
      await onGenerateBill(ticketId);
    } finally {
      setGenerating(null);
    }
  }

  function vehicleIcon(type: Ticket["vehicleType"]) {
    switch (type) {
      case "motorbike":
        return <Bike size={18} />;
      case "large":
        return <Truck size={18} />;
      default:
        return <Car size={18} />;
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-green-900/40 bg-[#0D1612] p-8">
        <h2 className="text-3xl font-bold text-white">
          Active Vehicles
        </h2>

        <p className="mt-6 text-gray-400">
          Loading active vehicles...
        </p>
      </section>
    );
  }

  return (
    <section style ={{marginTop:"10px"}} className="rounded-3xl border border-green-900/40 bg-[#0D1612] p-8 shadow-xl shadow-green-900/10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 style ={{marginLeft:"20px",marginTop:"8px"}} className="text-[20px] font-bold text-white">
            Active Vehicles
          </h2>

          <p style ={{marginLeft:"20px",marginTop:"10px" , marginBottom:"5px"}} className="text-gray-400">
            Vehicles currently inside parking
          </p>
        </div>

        <div style ={{marginRight:"110px"}} className="rounded-full bg-emerald-500/10 px-5 py-2 font-semibold text-emerald-300">
          {vehicles.length} Active
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-green-900">
        <table className="w-full">
          <thead className="bg-[#10261D]">
            <tr className="text-left text-sm uppercase tracking-wide text-gray-400">
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Slot</th>
              <th className="px-6 py-4">Gate</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-gray-400"
                >
                  No active vehicles
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  className="border-t border-green-900/40 transition hover:bg-[#10261D]"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
                        <User size={18} />
                      </div>

                      <span className="font-medium text-white">
                        {vehicle.owner}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-5 font-semibold text-white">
                    {vehicle.vehicleNumber}
                  </td>

                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#163127] px-3 py-2 capitalize text-emerald-300">
                      {vehicleIcon(vehicle.vehicleType)}
                      {vehicle.vehicleType}
                    </div>
                  </td>

                  <td className="px-6 py-5 font-semibold text-emerald-400">
                    {vehicle.slotId}
                  </td>

                  <td className="px-6 py-5 text-gray-300">
                    {vehicle.gateId}
                  </td>

                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() =>
                        handleGenerateBill(vehicle.id)
                      }
                      disabled={generating === vehicle.id}
                      className="inline-flex w-40 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-green-600 px-5 py-3 font-semibold text-black transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Receipt size={18} />

                      {generating === vehicle.id
                        ? "Generating..."
                        : "Generate Bill"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}