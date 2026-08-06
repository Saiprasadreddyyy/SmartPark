import { useState } from "react";
import api from "../api/axios";

import Navbar from "../components/Navbar";
import Stats from "../components/dashboard/Stats";
import ParkingGrid from "../components/dashboard/ParkingGrid";
import ActiveVehicles from "../components/dashboard/ActiveVehicles";
import PaymentModal from "../components/dashboard/PaymentModal";

interface Bill {
  billId: string;
  ticketId: string;
  vehicleNumber: string;
  vehicleType: "car" | "motorbike" | "large";
  owner: string;
  slotId: string;
  entryTime: string;
  exitTime: string;

  duration: {
    hours: number;
    minutes: number;
    totalMinutes: number;
  };

  ratePerHour: number;
  amount: number;
  tax: number;
  totalAmount: number;

  paymentStatus:
    | "pending"
    | "paid"
    | "cancelled";

  paymentMethod:
    | "cash"
    | "card"
    | "upi"
    | "wallet"
    | null;
}

export default function AdminDashboard() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [bill, setBill] =
    useState<Bill | null>(null);

  return (
    <div className="min-h-screen bg-[#08110D]">

      <Navbar />

      <main className="mx-auto max-w-8xl px-8 py-10 space-y-10">

        {/* Heading */}

        <div className="w-770 border border-[#1f4b39] bg-[#0D1612] p-8">

          <h1 style = {{marginTop:"5px",marginLeft:"15px"}} className="text-2xl font-extrabold text-emerald-400">
            Smart Parking Dashboard
          </h1>

          <p style = {{marginLeft: "18px",marginBottom :"10px"}} className="mt-3 text-gray-400 text-lg">
            Monitor parking slots, active vehicles and payments in real time.
          </p>

        </div>

        <Stats />

        <ParkingGrid />

        <ActiveVehicles
          onGenerateBill={async (
            ticketId: string
          ) => {
            try {
              const { data } =
                await api.post(
                  "/billing/generate",
                  {
                    ticketId,
                  }
                );

              setBill(data.data);

            } catch (err: any) {

              alert(
                err.response?.data
                  ?.message ||
                  "Unable to generate bill"
              );

            }
          }}
        />

      </main>

      {bill && (
        <PaymentModal
          bill={bill}
          onClose={() => setBill(null)}
          onPaymentSuccess={() =>
            setBill(null)
          }
        />
      )}

    </div>
  );
}