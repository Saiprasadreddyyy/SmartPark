import { ReactNode } from "react";

interface Props {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
}: Props) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-[#1f4b39]
        bg-[#0D1612]
        p-7
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-emerald-500
        hover:shadow-[0_0_35px_rgba(16,185,129,0.18)]
      "
    >
      {/* Glow */}
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative flex items-start justify-between">

        <div>

          <p style = {{marginLeft:"80px",marginTop:"10px"}} className="text-[14px] font-medium uppercase tracking-wider text-gray-500">
            {title}
          </p>

          <h2 style = {{marginLeft:"20px"}} className="mt-3 text-3xl font-extrabold text-white">
            {value}
          </h2>

          <p style = {{marginLeft:"80px",marginBottom:"10px"}} className="mt-3 text-sm text-gray-400">
            {subtitle}
          </p>

        </div>

        <div
        style ={{marginRight:"10px", marginTop:"10px"}}
          className="
            flex
            h-10
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-br
            from-emerald-400
            to-green-600
            text-black
            shadow-lg
            shadow-emerald-500/20
          "
        >
          {icon}
        </div>

      </div>
    </div>
  );
}