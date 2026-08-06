import { useState } from "react";
import api from "../../api/axios";
import {
  CreditCard,
  Wallet,
  Smartphone,
  DollarSign,
  Clock,
  Car,
  Bike,
  Truck,
  Receipt,
  X,
  CheckCircle,
} from "lucide-react";

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

  paymentStatus: "pending" | "paid" | "cancelled";

  paymentMethod:
    | "cash"
    | "card"
    | "upi"
    | "wallet"
    | null;
}

interface Props {
  bill: Bill;
  onClose: () => void;
  onPaymentSuccess: (bill: Bill) => void;
}

export default function PaymentModal({
  bill,
  onClose,
  onPaymentSuccess,
}: Props) {
  const [selectedMethod, setSelectedMethod] =
    useState<
      "cash" | "card" | "upi" | "wallet" | null
    >(null);

  const [processing, setProcessing] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const paymentMethods = [
    {
      id: "cash",
      title: "Cash",
      icon: <DollarSign size={24} />,
    },
    {
      id: "card",
      title: "Card",
      icon: <CreditCard size={24} />,
    },
    {
      id: "upi",
      title: "UPI",
      icon: <Smartphone size={24} />,
    },
    {
      id: "wallet",
      title: "Wallet",
      icon: <Wallet size={24} />,
    },
  ] as const;

  function vehicleIcon() {
    switch (bill.vehicleType) {
      case "motorbike":
        return <Bike size={28} />;

      case "large":
        return <Truck size={28} />;

      default:
        return <Car size={28} />;
    }
  }

  function formatDuration() {
    if (bill.duration.hours === 0) {
      return `${bill.duration.minutes} mins`;
    }

    if (bill.duration.minutes === 0) {
      return `${bill.duration.hours} hrs`;
    }

    return `${bill.duration.hours}h ${bill.duration.minutes}m`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  async function handlePayment() {
    if (!selectedMethod) {
      alert("Select payment method");
      return;
    }

    setProcessing(true);

    try {
      const { data } = await api.post(
        "/billing/payment",
        {
          billId: bill.billId,
          paymentMethod: selectedMethod,
        }
      );

     
    } catch (err: any) {
      alert(
        err.response?.data?.error ??
          "Payment Failed"
      );
    } finally {
      setProcessing(false);
    }
  }

  if (completed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">

        <div className="w-[420px] rounded-3xl border border-green-800 bg-[#0D1612] p-10 text-center shadow-2xl shadow-green-500/20">

          <div className="flex justify-center">

            <div className="rounded-full bg-green-500/20 p-5">

              <CheckCircle
                size={70}
                className="text-green-400"
              />

            </div>

          </div>

          <h2 className="mt-8 text-3xl font-bold text-white">

            Payment Successful

          </h2>

          <p className="mt-3 text-gray-400">

            Thank you for using SmartPark.

          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur">

      <div className="w-250  overflow-hidden rounded-3xl border border-green-900 bg-[#0D1612] shadow-2xl shadow-green-900/30">

        <div className="flex items-center justify-between border-b border-green-900 px-8 py-6">

          <div className="flex items-center gap-4">

            <div style ={{margin:"20px"}} className="rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 p-3 text-black">

              <Receipt size={28} />

            </div>

            <div>

              <h2 style ={{marginTop:"20px"}}className="text-[20px] font-bold text-white">
                Payment Summary
              </h2>

              <p style = {{marginBottom:"10px"}} className="text-gray-400">
                Complete your parking payment
              </p>

            </div>

          </div>

          <button
          style ={{marginRight:"40px"}}
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 transition hover:bg-[#10261D] hover:text-white"
          >
            <X size={24} />
          </button>

        </div>

        <div className="grid gap-10 p-8 lg:grid-cols-2">

          <div className="space-y-6">

            <div style = {{marginLeft:"20px",marginTop:"20px"}} className=" border border-green-900 bg-[#10261D] p-6">

              <div style ={{marginLeft:"10px",marginTop:"10px"}} className="flex items-center gap-9">

                <div className=" h-8 w-8 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 p-4 text-black">

                  {vehicleIcon()}

                </div>

                <div>

                  <h3 className="text-18px font-bold text-white">

                    {bill.vehicleNumber}

                  </h3>

                  <p className="capitalize text-gray-400">

                    {bill.vehicleType}

                  </p>
                  <div
  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
    bill.paymentStatus === "paid"
      ? "bg-green-500/20 text-green-400"
      : "bg-yellow-500/20 text-yellow-300"
  }`}
>
  {bill.paymentStatus.toUpperCase()}
</div>

                </div>

              </div>

              <div style ={{marginLeft:"20px",marginRight:"20px"}} className="mt-6 space-y-3 text-gray-300">

                <div className="flex justify-between">
                  <span>Owner</span>
                  <span>{bill.owner}</span>
                </div>

                <div className="flex justify-between">
                  <span>Slot</span>
                  <span>{bill.slotId}</span>
                </div>

                <div className="flex justify-between">
                  <span>Entry</span>
                  <span>{formatDate(bill.entryTime)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Exit</span>
                  <span>{formatDate(bill.exitTime)}</span>
                </div>

                <div className="flex justify-between">

                  <span className="flex items-center gap-2">

                    <Clock size={16} />

                    Duration

                  </span>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-emerald-400">

                    {formatDuration()}

                  </span>

                </div>

              </div>

            </div>
                      </div>

          <div className="space-y-6">

            <div style ={{marginLeft:"20px",marginTop:"20px",marginBottom:"10px"}} className="w-90 border border-green-900 bg-[#10261D] p-6">

              <h3 style ={{marginLeft:"110px",marginTop:"10px"}} className="mb-6 text-[18px] font-bold text-white">
                Billing Details
              </h3>

              <div style ={{margin:"20px"}} className="space-y-4">

                <div className="flex justify-between text-gray-300">
                  <span>Rate / Hour</span>
                  <span>₹{bill.ratePerHour}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Parking Charges</span>
                  <span>₹{bill.amount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>GST</span>
                  <span>₹{bill.tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-green-900 pt-4">

                  <div className="flex justify-between text-2xl font-bold">

                    <span className= "text-[20px] text-white">
                      Total
                    </span>

                    <span className="bg-gradient-to-r from-emerald-400 text-[20px] to-green-300 bg-clip-text text-transparent">

                      ₹{bill.totalAmount.toFixed(2)}

                    </span>

                  </div>

                </div>

              </div>

            </div>

            <div style ={{marginRight:"60px",marginBottom:"20px",marginTop:"20px"}} className="w-80px border border-green-900 bg-[#10261D] p-6">

              <h3 style= {{marginLeft:"130px",marginTop:"10px"}} className="mb-5 text-[18px] font-bold text-white">

                Payment Method

              </h3>

              <div style = {{margin:"20px"}} className="grid grid-cols-2 gap-4">

                {paymentMethods.map((method) => (

                  <button
                    key={method.id}
                    onClick={() =>
                      setSelectedMethod(method.id)
                    }
                    className={`rounded-2xl border p-5 transition-all duration-300
                    ${
                      selectedMethod === method.id
                        ? "border-emerald-400 bg-emerald-500/15 shadow-lg shadow-green-500/20"
                        : "border-green-900 bg-[#0D1612] hover:border-emerald-500"
                    }`}
                  >

                    <div className="flex flex-col items-center gap-3">

                      <div
                      style={{marginTop:"10px"}}
                        className={`rounded-2xl p-3
                        ${
                          selectedMethod === method.id
                            ? "bg-gradient-to-br from-emerald-400 to-green-600 text-black"
                            : "bg-[#163127] text-emerald-400"
                        }`}
                      >
                        {method.icon}
                      </div>

                      <span className="font-semibold text-white">
                        {method.title}
                      </span>

                    </div>

                  </button>

                ))}

              </div>

            </div>

          </div>

        </div>

        <div style = {{marginLeft:"20px"}} className="flex items-center justify-between border-t border-green-900 bg-[#09120F] px-8 py-6">

          <button
            onClick={onClose}
            className="w-40 border border-green-900 px-8 py-3 font-semibold text-gray-300 transition hover:border-emerald-500 hover:text-white"
          >
            Cancel
          </button>

          <button
          style ={{margin:"25px"}}
            onClick={handlePayment}
            disabled={
                processing ||
                selectedMethod === null ||
                bill.paymentStatus === "paid"
            }
            className=" w-40 bg-gradient-to-r from-emerald-400 to-green-300 px-10 py-3 font-bold text-black transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bill.paymentStatus === "paid"
              ? "Already Paid"
                : processing
                ? "Processing..."
                : `Pay ₹${bill.totalAmount.toFixed(2)}`}
          </button>

        </div>

      </div>

    </div>
  );
}