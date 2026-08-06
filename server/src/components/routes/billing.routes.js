import express from 'express';
const BillingRouter = express.Router();
import {
  generateBillController,
  processPaymentController,
  getBillController,
  getAllBillsController,
  getRevenueStatsController
} from '../controllers/billing.controller.js';

import {authMiddleware} from "../middleware/auth.middleware.js";
import { adminMiddleware } from '../middleware/admin.middleware.js';

BillingRouter.post('/generate', authMiddleware ,generateBillController);

BillingRouter.post('/payment', authMiddleware ,processPaymentController);

BillingRouter.get('/ticket/:ticketId', authMiddleware, getBillController);

BillingRouter.get('/all',authMiddleware,adminMiddleware, getAllBillsController);

BillingRouter.get('/revenue/stats', authMiddleware, adminMiddleware, getRevenueStatsController);

export default BillingRouter;
