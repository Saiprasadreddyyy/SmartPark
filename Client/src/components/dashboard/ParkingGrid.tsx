import { useEffect, useState } from "react";
import { Car, Bike, Truck } from "lucide-react";
import api from "../../api/axios";
import socket from "../../socket/socket";

interface Slot {
  _id: string;
  id: string;
  floor: number;
  type: "car" | "motorbike" | "large";
  occupied: boolean;
  currentTicket: string | null;
}

export default function ParkingGrid() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSlots() {
    try {
      const { data } = await api.get("/admin/slots");
      setSlots(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSlots();

    socket.on("slotAllocated", fetchSlots);
    socket.on("slotReleased", fetchSlots);

    return () => {
      socket.off("slotAllocated", fetchSlots);
      socket.off("slotReleased", fetchSlots);
    };
  }, []);

  function vehicleIcon(type: Slot["type"]) {
    switch (type) {
      case "motorbike":
        return <Bike size={34} />;
      case "large":
        return <Truck size={34} />;
      default:
        return <Car size={34} />;
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl border border-[#1f4b39] bg-[#0D1612] p-10">
        <h2 className="text-3xl font-bold text-emerald-400">
          Parking Layout
        </h2>

        <div className="mt-10 text-center text-gray-400">
          Loading parking slots...
        </div>
      </section>
    );
  }

  const grouped = slots.reduce<Record<number, Slot[]>>((acc, slot) => {
    if (!acc[slot.floor]) acc[slot.floor] = [];
    acc[slot.floor].push(slot);
    return acc;
  }, {});

  const available = slots.filter((s) => !s.occupied).length;
  const occupied = slots.filter((s) => s.occupied).length;

  return (
    <section className="rounded-3xl border border-[#1f4b39] bg-[#0D1612] p-8">

      {/* Header */}

      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">

        <div>

          <h2 style ={{marginLeft:"10px",marginTop:"10px"}} className="text-[20px] font-bold text-emerald-400">
            Parking Layout
          </h2>

          <p style ={{marginLeft:"10px"}} className="mt-2 text-gray-500">
            Live Slot Monitoring
          </p>

        </div>

        <div className="flex gap-3">

          <div style = {{marginRight:"10px",marginTop:"10px"}} className="rounded-xl w-15 border border-emerald-700 bg-emerald-500/10 px-5 py-3">

            <p style ={{marginLeft:"4px"}} className="text-xs text-gray-400">
              Available
            </p>

            <p className="text-2xl flex justify-center-safe font-bold text-emerald-400">
              {available}
            </p>

          </div>

          <div style ={{marginRight:"30px",marginTop:"10px"}} className="rounded-xl w-16 border border-red-700 bg-red-500/10 px-5 py-3">

            <p className="text-xs text-gray-400">
              Occupied
            </p>

            <p className="text-2xl flex justify-center-safe font-bold text-red-400">
              {occupied}
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-12">

        {Object.keys(grouped)
          .sort((a, b) => Number(a) - Number(b))
          .map((floor) => (

            <div key={floor}>

              <div className="mb-6 flex items-center gap-3">

                <div className="h-10 w-2 rounded-full bg-emerald-500" />

                <h3 className="text-[18px] font-bold text-white">
                  Floor {floor}
                </h3>

              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

                {grouped[Number(floor)].map((slot) => (

                  <div
                  style ={{marginLeft:"12px",marginRight:"12px"}}
                    key={slot._id}
                    className={`rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                    ${
                      slot.occupied
                        ? "border-red-700 bg-gradient-to-br from-[#291313] to-[#1A1111] hover:shadow-red-900/30"
                        : "border-[#1f4b39] bg-gradient-to-br from-[#10261D] to-[#0D1612] hover:border-emerald-500 hover:shadow-emerald-900/30"
                    }`}
                  >

                    <div className="flex justify-center">

                      <div
                      style = {{marginTop :"10px",marginBottom:"10px"}}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl
                        ${
                          slot.occupied
                            ? "bg-red-500/15 text-red-400"
                            : "bg-emerald-500/15 text-emerald-400"
                        }`}
                      >
                        {vehicleIcon(slot.type)}
                      </div>

                    </div>

                    <h4 className="mt-5 text-center text-[16px] font-bold text-white">
                      {slot.id}
                    </h4>

                    <p style ={{marginBottom:"10px"}} className="mt-2 text-center text-[16px] uppercase tracking-wider text-gray-500">
                      {slot.type}
                    </p>

                    <div
                      className={`mt-6 rounded-xl py-3 text-center font-semibold
                      ${
                        slot.occupied
                          ? "bg-red-500 text-white"
                          : "bg-emerald-500 text-black"
                      }`}
                    >
                      {slot.occupied ? "Occupied" : "Available"}
                    </div>

                  </div>

                ))}

              </div>

            </div>

          ))}

      </div>

    </section>
  );
}