import express from "express";
import cors from "cors";
import { errorHandler } from "./components/middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import Authrouter from "./components/routes/auth.routes.js";
import AdminRouter from "./components/routes/admin.routes.js";
import UserRouter from "./components/routes/user.routes.js";
import BillingRouter from "./components/routes/billing.routes.js";

const app = express();

const allowedOrigins = [
  "https://smart-park-swart.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS: " + origin));
    }
  },
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", Authrouter);
app.use("/api/user", UserRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/billing", BillingRouter);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.use(errorHandler);

export default app;
