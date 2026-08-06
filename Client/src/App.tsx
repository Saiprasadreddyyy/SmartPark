import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import UserRoute from "./routes/UserRoute";

function HomeRedirect() {
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeRedirect />
            </ProtectedRoute>
          }
        />

    <Route
    path="/dashboard"
    element={
        <ProtectedRoute>
            <UserRoute>
                <UserDashboard />
            </UserRoute>
        </ProtectedRoute>
    }
/>

<Route
    path="/admin"
    element={
        <ProtectedRoute>
            <AdminRoute>
                <AdminDashboard />
            </AdminRoute>
        </ProtectedRoute>
    }
/>
</Routes>
  );
}