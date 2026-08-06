import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function UserRoute({
  children,
}: Props) {
  const token = localStorage.getItem("accessToken");

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "user") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}