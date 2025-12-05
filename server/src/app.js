import express from "express";
import cors from "cors";
import parkingRoutes from "./components/routes/parking.routes.js";
import billingRoutes from "./components/routes/billing.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/parking", parkingRoutes);
app.use("/api/billing", billingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!", message: err.message });
});

export default app;
