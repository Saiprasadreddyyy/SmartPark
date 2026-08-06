import { Car, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-green-900/40 bg-[#0D1612] p-10 shadow-2xl shadow-green-900/10">

      {/* Background */}

      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-green-500/10 blur-[100px]" />

      <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-[100px]" />

      <div className="relative flex items-center justify-between">

        <div>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-800 bg-[#10261D] px-4 py-2">

            <Sparkles
              size={16}
              className="text-emerald-400"
            />

            <span className="text-sm text-emerald-300">
              Smart Parking Management
            </span>

          </div>

          <h1 className="text-5xl font-extrabold leading-tight">

            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-green-100 bg-clip-text text-transparent">

              🚗 SmartParking Lot

            </span>

          </h1>

          <p className="mt-5 max-w-xl text-lg text-gray-400">

            Monitor parking slots, manage vehicles,
            collect payments and track occupancy
            in real-time.

          </p>

        </div>

        <div className="hidden lg:flex">

          <div className="flex h-36 w-36 items-center justify-center rounded-[40px] bg-gradient-to-br from-emerald-400 to-green-600 shadow-2xl shadow-green-500/30">

            <Car
              size={70}
              className="text-black"
            />

          </div>

        </div>

      </div>

    </section>
  );
}