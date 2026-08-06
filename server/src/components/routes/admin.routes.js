import express from "express";
const AdminRouter = express.Router();

import {
  parkVehicle,
  exitVehicle,
  getParkedVehicles,
  getAllSlots,
  getStats,
  getStatsEndpoint
} from "../controllers/parking.controller.js";

import {authMiddleware} from "../middleware/auth.middleware.js";
import {adminMiddleware} from "../middleware/admin.middleware.js";

AdminRouter.get("/vehicles", authMiddleware, adminMiddleware, getParkedVehicles);
AdminRouter.get("/slots", authMiddleware, adminMiddleware, getAllSlots);
AdminRouter.get("/stats", authMiddleware, adminMiddleware, getStatsEndpoint);

export default AdminRouter;