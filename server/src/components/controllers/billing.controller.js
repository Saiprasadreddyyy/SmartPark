import {
    generateBill,
    processPayment,
    getBillByTicket,
    getAllBills,
    getRevenueStats
  } from '../services/billing.service.js';
  

  export async function generateBillController(req, res) {
    try {
      const { ticketId } = req.body;
      
      if (!ticketId) {
        return res.status(400).json({
          success: false,
          error: 'Ticket ID is required'
        });
      }
      
      const result = await generateBill(ticketId);
      
      res.status(201).json({
        success: true,
        message: result.message,
        data: result.bill
      });
    } catch (error) {
      console.error('Generate bill error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
  
  
  export async function processPaymentController(req, res) {
    try {
      const { billId, paymentMethod } = req.body;
      
      if (!billId || !paymentMethod) {
        return res.status(400).json({
          success: false,
          error: 'Bill ID and payment method are required'
        });
      }
      
      const result = await processPayment(billId, paymentMethod);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.bill
      });
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
  
  
  export async function getBillController(req, res) {
    try {
      const { ticketId } = req.params;
      
      const bill = await getBillByTicket(ticketId);
      
      if (!bill) {
        return res.status(404).json({
          success: false,
          error: 'Bill not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: bill
      });
    } catch (error) {
      console.error('Get bill error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  
  export async function getAllBillsController(req, res) {
    try {
      const {
        paymentStatus,
        vehicleType,
        startDate,
        endDate,
        limit,
        skip
      } = req.query;
      
      const result = await getAllBills({
        paymentStatus,
        vehicleType,
        startDate,
        endDate,
        limit: parseInt(limit) || 50,
        skip: parseInt(skip) || 0
      });
      
      res.status(200).json({
        success: true,
        data: result.bills,
        total: result.total,
        limit: result.limit,
        skip: result.skip
      });
    } catch (error) {
      console.error('Get all bills error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  
  export async function getRevenueStatsController(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await getRevenueStats(startDate, endDate);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get revenue stats error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
