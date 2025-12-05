import express from 'express';
const router = express.Router();
import {
  generateBillController,
  processPaymentController,
  getBillController,
  getAllBillsController,
  getRevenueStatsController
} from '../controllers/billing.controller.js';

// Generate bill on exit
router.post('/generate', generateBillController);

// Process payment
router.post('/payment', processPaymentController);

// Get bill by ticket ID
router.get('/ticket/:ticketId', getBillController);

// Get all bills
router.get('/all', getAllBillsController);

// Get revenue statistics
router.get('/revenue/stats', getRevenueStatsController);

export default router;