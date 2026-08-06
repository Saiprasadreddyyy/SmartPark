import { useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  Car,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      if (!data.success) {
        throw new Error(data.message);
      }

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
        err.response?.data?.message ||
          err.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08110D] px-6">

      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute -left-20 -top-20 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[180px]" />

        <div className="absolute -bottom-20 -right-20 h-[450px] w-[450px] rounded-full bg-green-400/10 blur-[180px]" />

      </div>

      <div className="relative w-full max-w-[1220px]">

        <div  style = {{marginLeft : "100px"}} className="rounded-[60px] h-130 w-250 border border-[#156147] bg-[#07100D] px-32 py-49 shadow-[0_0_120px_rgba(16,185,129,.08)]">          {/* Logo */}

            <div className="flex justify-center">
    <div style = {{marginTop:"30px"}} className="flex h-12 w-15 items-center justify-center rounded-lg bg-[#16D78A]">
        <Car  size={36} className="text-black" />
    </div>
</div>
  {/* Heading */}
          <p style = {{marginTop: "30px",marginBottom : "30px"}} className="mt-8 text-center text-[28px] font-medium text-gray-400">

            Smart Parking Management System

          </p>

          {error && (
            <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-center text-red-400">
              {error}
            </div>
          )}

          <form
            autoComplete="off"
            onSubmit={handleSubmit}
            className="mt-12 space-y-12"
          >

            {/* Email */}

            <div className="mt-24">

  <label style = {{ marginLeft: "100px", marginBottom : "10px"}}
  className="mb-6 block  text-[20px] font-semibold text-emerald-300">
    Email
  </label>

            <div className="flex items-center gap-5">

  <Mail
  style = {{marginLeft : "50px"}}
    size={28}
    className="text-emerald-500"
  />

  <input
  style = {{paddingLeft : "18px"}}
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="   Enter your email"
    className="h-10 w-106 rounded-[12px] border border-[#24573F] bg-[#10261D]  text-[18px] text-emerald-100 placeholder:text-[#00A56F] outline-none"
  />

</div>

</div>

            {/* Password */}

           <div className="mt-14">

    <label style={{ marginLeft : "100px", marginBottom: "10px" , marginTop: "20px"}} className="mb-5 block text-[19px] font-semibold text-emerald-300">
        Password
    </label>
<div className="flex items-center gap-5">

  <Lock
  style = {{marginLeft: "50px"}}
    size={28}
    className="text-emerald-500"
  />

  <div className="relative w-full">

    <input
    style = {{paddingLeft: "18px"}}
      type={showPassword ? "text" : "password"}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="   Enter your password"
      className="h-10 w-106 rounded-[12px] border border-[#24573F] bg-[#10261D] pl-40 pr-14 text-[18px] text-emerald-100 placeholder:text-[#00A56F] outline-none"
    />

    <button style = {{marginRight : "480px"}}
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-400"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>

  </div>

</div>
</div>
            {/* Login */}

<div className="mt-20 flex justify-center">
  <button style= {{marginTop: "50px",marginBottom : "30px"}}
    disabled={loading}
    className="flex h-8 w-40 items-center justify-center gap-5 rounded-[28px] bg-[#11D06F] text-[20px] font-bold text-black transition hover:brightness-110 disabled:opacity-60"
  >
    {loading ? (
      <>
        <div style = {{}} className="h-8 w-40 animate-spin rounded-full border-4 border-black  text-[10px] border-t-transparent" />
        Signing In...
      </>
    ) : (
      <>
        Login
        <ArrowRight size={24} />
      </>
    )}
  </button>
</div>
          </form>

              <p className="mt-16 text-center text-[18px] text-gray-400">
            Don't have an account?{" "}

            <Link
              to="/signup"
              className="font-bold text-[#12D98C]"
            >
              Create Account
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}