import express from 'express';
const router = express.Router();
import {
  generateBillController,
  processPaymentController,
  getBillController,
  getAllBillsController,
  getRevenueStatsController
} from '../controllers/billing.controller.js';


router.post('/generate', generateBillController);


router.post('/payment', processPaymentController);


router.get('/ticket/:ticketId', getBillController);


router.get('/all', getAllBillsController);


router.get('/revenue/stats', getRevenueStatsController);

export default router;