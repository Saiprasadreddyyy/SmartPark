import { useState } from "react";
import api from "../../api/axios";
import PaymentModal from "./PaymentModal";

export default function ExitVehicleCard() {
  const [loading, setLoading] = useState(false);

  const [bill, setBill] = useState<any>(null);

async function exitVehicle() {
  setLoading(true);

  try {

    const ticket = await api.get("/user/my-ticket");

    const billResponse = await api.post(
      "/billing/generate",
      {
        ticketId: ticket.data.data.id,
      }
    );

    setBill(billResponse.data.data);

  } catch (err: any) {
    alert(
      err.response?.data?.message ||
      "Unable to generate bill."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <>
      <section className="rounded-3xl border border-green-900/40 bg-[#0D1612] p-8">

        <h2 style = {{marginLeft:"20px",marginTop:"30px"}} className="text-[25px] font-bold text-white">
          Exit Vehicle
        </h2>

        <p style = {{marginLeft:"20px",marginTop:"20px"}} className="mt-2 text-gray-400">
          Generate parking bill and pay.
        </p>

        <button
          style = {{marginLeft:"20px",marginTop:"20px"}} 
          onClick={exitVehicle}
          disabled={loading}
          className="mt-8 w-80  rounded-2xl bg-red-500 py-4 font-bold text-white"
        >
          {loading ? "Processing..." : "Exit Parking"}
        </button>

      </section>

      {bill && (
        <PaymentModal
    bill={bill}
    onClose={() => setBill(null)}
    onPaymentSuccess={() => {
        setBill(null);
        window.location.reload();
    }}
/>
      )}
    </>
  );
}