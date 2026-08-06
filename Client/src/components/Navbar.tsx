import { NavLink, useNavigate } from "react-router-dom";
import {
  Car,
  LayoutDashboard,
  ParkingCircle,
  Receipt,
  Shield,
  LogOut,
  User,
} from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-emerald-400 to-green-500 text-black shadow-xl shadow-emerald-500/20"
        : "text-gray-300 hover:bg-[#10261D] hover:text-emerald-400"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#1C4332] bg-[#09120F]/95 backdrop-blur-xl">

      <div className="mx-auto flex h-24 max-w-[1600px] items-center justify-between px-12">

        {/* Logo */}

        <div className="flex items-center gap-5">

          <div style = {{marginLeft:"9px"}} className="flex h-9 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 shadow-xl shadow-green-500/20">

            <Car
              size={30}
              className="text-black"
            />

          </div>

          <div>

            <p className="mt-1 text-1xl text-gray-400">
              Smart Parking Management System
            </p>

          </div>

        </div>

        {/* Navigation */}

        <nav className="flex items-center gap-4">

          <NavLink
            to="/dashboard"
            className={navClass}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/parking"
            className={navClass}
          >
            <ParkingCircle size={18} />
            Parking
          </NavLink>

          <NavLink
            to="/billing"
            className={navClass}
          >
            <Receipt size={18} />
            Billing
          </NavLink>

          {user.role === "admin" && (
            <NavLink
              to="/admin"
              className={navClass}
            >
              <Shield size={14} />
              Admin
            </NavLink>
          )}

        </nav>

        {/* User */}

        <div className="flex items-center gap-5">

          <div className="flex items-center gap-4 w-62  rounded-3xl border border-[#214C38] bg-[#10261D] px-6 py-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600">

              <User
                size={20}
                className="text-black"
              />

            </div>
<div>
    <p className="font-semibold text-white">
        {user.name}
    </p>

    <p className="text-xs text-emerald-400 capitalize">
        {user.role}
    </p>
</div>

          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 w-25 rounded-2xl text-[14px] border border-red-500/40 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-xl hover:shadow-red-500/20"
          >
            <LogOut style={{marginLeft:"9px"}} size={18} />
            Logout
          </button>

        </div>

      </div>

    </header>
  );
}