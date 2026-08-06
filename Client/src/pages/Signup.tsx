import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
} from "lucide-react";

import api from "../api/axios";

export default function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    vehicleNumber: "",
    vehicleType: "car",
    password: "",
    confirmPassword: "",
  });

  function updateField(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (
      form.password !== form.confirmPassword
    ) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        "/auth/signup",
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          vehicleNumber:
            form.vehicleNumber,
          vehicleType:
            form.vehicleType,
          password: form.password,
        }
      );

      localStorage.setItem(
        "accessToken",
        data.accessToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err: any) {

      setError(
        err.response?.data?.message ??
          "Signup failed"
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#08110D] px-6">

      <div className="absolute inset-0">

        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-green-500/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[140px]" />

      </div>

      <div className="relative h-120 w-250">

        <div className="rounded-3xl border border-green-900/50 bg-[#0D1612]/90 p-10 shadow-2xl shadow-green-900/20 backdrop-blur-xl">

          <div className="flex justify-center">

            <div style ={{marginTop:"10px"}} className="flex h-14 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-green-600">

              <Car
                size={42}
                className="text-black"
              />

            </div>

          </div>

          <h1 className="mt-7 bg-gradient-to-r from-emerald-400 to-green-200 bg-clip-text text-center text-5xl font-extrabold text-transparent">

            SmartPark

          </h1>

          <p className="mt-3 text-center text-gray-400">

            Create your parking account

          </p>

          {error && (

            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-red-400">

              {error}

            </div>

          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >

            <div className="grid gap-6 md:grid-cols-2">
                        {/* Name */}

            <div>

              <label style ={{margin:"10px"}} className="mb-2 block text-[18px]  text-gray-300">
                Full Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                style={{paddingLeft:"45px"}}
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder=" John Doe"
                  required
                  className="h-7 w-full rounded-2xl border border-green-900 bg-[#10261D] py-3 pl-12 pr-4 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                />

              </div>

            </div>

            {/* Email */}

            <div>

              <label style ={{margin:"8px",marginTop:"15px"}} className="mb-2 block text-[18px] text-gray-300">
                Email
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                style={{paddingLeft:"45px"}}
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder=" john@email.com"
                  required
                  className="h-7 w-full rounded-2xl border border-green-900 bg-[#10261D] py-3 pl-12 pr-4 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                />

              </div>

            </div>

            {/* Phone */}

            <div>

              <label style ={{margin:"10px"}} className="mb-2 block text-[18px] text-gray-300">
                Phone
              </label>

              <div className="relative">

                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                style={{paddingLeft:"45px"}}
                  name="phone"
                  value={form.phone}
                  onChange={updateField}
                  placeholder=" 9876543210"
                  required
                  className="h-7 w-full rounded-2xl border border-green-900 bg-[#10261D] py-3 pl-12 pr-4 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                />

              </div>

            </div>

            {/* Vehicle Number */}

            <div>

              <label style ={{margin:"8px",marginTop:"14px"}} className="mb-2 block text-18px text-gray-300">
                Vehicle Number
              </label>

              <div className="relative">

                <Car
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                style={{paddingLeft:"45px"}}
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={updateField}
                  placeholder=" MH13CS5754"
                  required
                  className="h-7 w-full rounded-2xl border border-green-900 bg-[#10261D] py-3 pl-12 pr-4 uppercase text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                />

              </div>

            </div>

            {/* Vehicle Type */}

            <div>

              <label style ={{margin:"10px"}} className="mb-2 block text-[18px] text-gray-300">
                Vehicle Type
              </label>

              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={updateField}
                className=" h-7 w-full rounded-2xl border border-green-900 bg-[#10261D] px-4 py-3 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
              >
                <option value="car">Car</option>
                <option value="motorbike">Motorbike</option>
                <option value="large">Large Vehicle</option>
              </select>

            </div>

            <div />

            {/* Password */}

            <div>

              <label style ={{margin:"10px"}} className="mb-2 block text-[18px] text-gray-300">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                style={{paddingLeft:"45px"}}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  required
                  className=" h-7 w-full rounded-2xl border border-green-900 bg-[#10261D] py-3 pl-12 pr-12 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {/* Confirm Password */}

            <div>

              <label style ={{margin:"8px", marginTop:"15px"}} className="mb-2 block text-18px text-gray-300">
                Confirm Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                style={{paddingLeft:"45px"}}
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                  className="h-7 w-full rounded-2xl border border-green-900 bg-[#10261D] py-3 pl-12 pr-12 text-white outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(!showConfirm)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400"
                >
                  {showConfirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

          </div>

          <button
            style ={{marginTop :"30px",marginLeft :"180px"}}
            type="submit"
            disabled={loading}
            className=" mt-8 flex w-7/12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 py-3 font-bold text-black transition duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="h-5 w-2 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <p style= {{marginTop:"25px"}} className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Login
            </Link>

          </p>

        </form>

      </div>

    </div>

  </div>

);
}