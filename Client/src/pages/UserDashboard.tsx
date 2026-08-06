import { useEffect, useState } from "react";

import Hero from "../components/dashboard/Hero";
import Stats from "../components/dashboard/Stats";
import ParkVehicleCard from "../components/dashboard/ParkVehicleCard";
import ExitVehicleCard from "../components/dashboard/ExitVehicleCard";
import ParkingGrid from "../components/dashboard/ParkingGrid";
import ActiveVehicles from "../components/dashboard/ActiveVehicles";

import api from "../api/axios";
import socket from "../socket/socket";

export default function UserDashboard() {
  const [ticket, setTicket] = useState<any>(null);

  async function fetchTicket() {
    try {
      const { data } = await api.get("/user/my-ticket");

      setTicket(data.data);

    } catch {
      setTicket(null);
    }
  }

  useEffect(() => {
    fetchTicket();

    socket.on("slotAllocated", fetchTicket);
    socket.on("slotReleased", fetchTicket);

    return () => {
      socket.off("slotAllocated", fetchTicket);
      socket.off("slotReleased", fetchTicket);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#08110D] px-8 py-8">

      <div className="mx-auto max-w-7xl space-y-8">

        {!ticket ? (
          <ParkVehicleCard />
        ) : (
          <ExitVehicleCard />
        )}

      </div>

    </main>
  );
}