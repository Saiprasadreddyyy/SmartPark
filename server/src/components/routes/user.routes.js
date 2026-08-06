import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { parkVehicle, exitVehicle, getParkingHistory , getCurrentTicket } from '../controllers/parking.controller.js';
import { parkVehicleSchema , exitVehicleSchema } from '../../validations/parking.validation.js';

const UserRouter = express.Router();

UserRouter.post("/park", authMiddleware, validate(parkVehicleSchema),parkVehicle);

UserRouter.post("/exit", authMiddleware, validate(exitVehicleSchema),exitVehicle);

UserRouter.get("/history", authMiddleware, getParkingHistory);

UserRouter.get("/my-ticket", authMiddleware, getCurrentTicket);

export default  UserRouter;