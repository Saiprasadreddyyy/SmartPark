import express from "express";
const router = express.Router();

import {
  parkVehicle,
  exitVehicle,
  getParkedVehicles,
  getAllSlots,
  getStats
} from "../controllers/parking.controller.js";


router.post("/park", parkVehicle);
router.post("/exit", exitVehicle);
router.get("/vehicles", getParkedVehicles);
router.get("/slots", getAllSlots);
router.get("/stats", getStats);

export default router;
