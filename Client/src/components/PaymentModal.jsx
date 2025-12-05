import React, { useState } from 'react';
import axios from 'axios';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  DollarSign, 
  Clock, 
  Car, 
  Bike, 
  Truck,
  Receipt,
  X,
  CheckCircle
} from 'lucide-react';
import './PaymentModals.css';

const API_BASE = "http://localhost:5050/api";

const PaymentModal = ({ bill, onClose, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: <DollarSign size={24} /> },
    { id: 'card', name: 'Card', icon: <CreditCard size={24} /> },
    { id: 'upi', name: 'UPI', icon: <Smartphone size={24} /> },
    { id: 'wallet', name: 'Wallet', icon: <Wallet size={24} /> }
  ];

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'car': return <Car size={24} />;
      case 'motorbike': return <Bike size={24} />;
      case 'large': return <Truck size={24} />;
      default: return <Car size={24} />;
    }
  };

  const formatDuration = (duration) => {
    if (duration.hours === 0) {
      return `${duration.minutes} minutes`;
    } else if (duration.minutes === 0) {
      return `${duration.hours} ${duration.hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${duration.hours}h ${duration.minutes}m`;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      const response = await axios.post(`${API_BASE}/billing/payment`, {
        billId: bill.billId,
        paymentMethod: selectedMethod
      });

      if (response.data.success) {
        setPaymentComplete(true);
        setTimeout(() => {
          if (onPaymentSuccess) {
            onPaymentSuccess(response.data.data);
          }
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (paymentComplete) {
    return (
      <div className="payment-overlay">
        <div className="payment-modal">
          <div className="payment-success">
            <CheckCircle size={80} className="success-icon" />
            <h2>Payment Successful!</h2>
            <p>Thank you for using our parking service</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <div className="header-content">
            <Receipt size={28} />
            <h2>Parking Bill</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="payment-body">
          <div className="info-section">
            <div className="info-card">
              <div className="info-header">
                <div className="vehicle-badge">
                  {getVehicleIcon(bill.vehicleType)}
                  <span className="vehicle-type">{bill.vehicleType.toUpperCase()}</span>
                </div>
              </div>
              <div className="vehicle-details">
                <div className="detail-row">
                  <span className="label">Vehicle Number:</span>
                  <span className="value vehicle-number">{bill.vehicleNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Owner:</span>
                  <span className="value">{bill.owner}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Slot:</span>
                  <span className="value slot-badge">{bill.slotId}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="time-section">
            <div className="time-card">
              <Clock size={20} />
              <div className="time-details">
                <div className="time-row">
                  <span className="time-label">Entry:</span>
                  <span className="time-value">{formatDate(bill.entryTime)}</span>
                </div>
                <div className="time-row">
                  <span className="time-label">Exit:</span>
                  <span className="time-value">{formatDate(bill.exitTime)}</span>
                </div>
                <div className="time-row duration-row">
                  <span className="time-label">Duration:</span>
                  <span className="duration-badge">{formatDuration(bill.duration)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="billing-section">
            <h3 className="section-title">Billing Details</h3>
            <div className="billing-breakdown">
              <div className="breakdown-row">
                <span>Rate per hour ({bill.vehicleType})</span>
                <span>₹{bill.ratePerHour}</span>
              </div>
              <div className="breakdown-row">
                <span>Parking Charges ({formatDuration(bill.duration)})</span>
                <span>₹{bill.amount.toFixed(2)}</span>
              </div>
              <div className="breakdown-row">
                <span>GST (18%)</span>
                <span>₹{bill.tax.toFixed(2)}</span>
              </div>
              <div className="breakdown-row total-row">
                <span>Total Amount</span>
                <span className="total-amount">₹{bill.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="payment-methods-section">
            <h3 className="section-title">Select Payment Method</h3>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className={`payment-method-btn ${selectedMethod === method.id ? 'selected' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="method-icon">{method.icon}</div>
                  <span className="method-name">{method.name}</span>
                  {selectedMethod === method.id && (
                    <CheckCircle size={20} className="selected-icon" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="payment-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="pay-btn" 
            onClick={handlePayment}
            disabled={!selectedMethod || processing}
          >
            {processing ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              `Pay ₹${bill.totalAmount.toFixed(2)}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;