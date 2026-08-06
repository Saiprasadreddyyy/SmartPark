import { useEffect, useState } from "react";
import {
  Car,
  ParkingCircle,
  Wallet,
  LayoutGrid,
} from "lucide-react";

import api from "../../api/axios";
import socket from "../../socket/socket";
import StatCard from "../ui/StatCard";

interface StatsData {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  activeTickets: number;
}

export default function Stats() {
  const [stats, setStats] = useState<StatsData>({
    totalSlots: 0,
    occupiedSlots: 0,
    availableSlots: 0,
    activeTickets: 0,
  });

  async function loadStats() {
    try {
      const { data } = await api.get("/admin/stats");
      setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadStats();

    socket.on("statusUpdate", loadStats);

    return () => {
      socket.off("statusUpdate", loadStats);
    };
  }, []);

  return (
    <section className="grid gap-14 sm:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Total Slots"
        value={stats.totalSlots.toString()}
        subtitle="Parking Capacity"
        icon={<LayoutGrid size={24} />}
      />

      <StatCard
        title="Available Slots"
        value={stats.availableSlots.toString()}
        subtitle="Ready to Park"
        icon={<ParkingCircle size={24} />}
      />

      <StatCard
        title="Occupied Slots"
        value={stats.occupiedSlots.toString()}
        subtitle="Vehicles Parked"
        icon={<Car size={24} />}
      />

      <StatCard
        title="Active Tickets"
        value={stats.activeTickets.toString()}
        subtitle="Currently Active"
        icon={<Wallet size={24} />}
      />

    </section>
  );
}