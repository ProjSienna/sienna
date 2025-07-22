import React, { createContext, useState, useContext, useEffect } from 'react';
import { externalApi } from '../utils/api';

const PaymentsContext = createContext();

export const usePayments = () => useContext(PaymentsContext);

export const PaymentsProvider = ({ children }) => {
  const [payments, setPayments] = useState(() => {
    // Initialize from localStorage if available
    const savedPayments = localStorage.getItem('payments');
    return savedPayments ? JSON.parse(savedPayments) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rerunPayment, setRerunPayment] = useState(null);

  // Save to localStorage whenever payments change
  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  // Create a new payment
  const createPayment = (paymentData) => {
    const newPayment = {
      ...paymentData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    setPayments([newPayment, ...payments]);
    return newPayment;
  };

  // Get a payment by ID
  const getPaymentById = (id) => {
    return payments.find(payment => payment.id === id);
  };

  // Handle rerunning a payment
  const prepareRerunPayment = (paymentName, originalName, recipients) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    // Create a name with date and time suffix
    const suggestedName = `${paymentName} - ${formattedDate} ${formattedTime}`;
    
    const paymentData = {
      name: suggestedName,
      originalName: originalName || paymentName,
      recipients
    };
    
    setRerunPayment(paymentData);
    
    // Also save to localStorage as a backup
    localStorage.setItem('rerunPayment', JSON.stringify(paymentData));
    
    return paymentData;
  };

  // Clear the rerun payment data
  const clearRerunPayment = () => {
    setRerunPayment(null);
    localStorage.removeItem('rerunPayment');
  };

  // Check if there's a rerun payment in localStorage on mount
  useEffect(() => {
    const storedRerunPayment = localStorage.getItem('rerunPayment');
    if (storedRerunPayment) {
      try {
        setRerunPayment(JSON.parse(storedRerunPayment));
      } catch (error) {
        console.error('Error parsing rerun payment data:', error);
        localStorage.removeItem('rerunPayment');
      }
    }
  }, []);

  // Enhanced functions that integrate with backend APIs

  // Submit a completed payment to the backend for record keeping
  const submitPaymentToBackend = async (paymentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const payment = getPaymentById(paymentId);
      if (!payment) {
        setError('Payment not found');
        return false;
      }
      
      // Submit to backend
      await externalApi.submitTransaction({
        type: 'payment',
        paymentId: payment.id,
        paymentName: payment.name,
        timestamp: payment.timestamp,
        recipientCount: payment.recipients?.length || 0,
        totalAmount: payment.totalAmount,
        status: payment.status
      });
      
      return true;
    } catch (err) {
      console.error('Failed to submit payment to backend:', err);
      setError('Payment saved locally but failed to sync with server.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate a receipt for a payment
  const generatePaymentReceipt = async (paymentId) => {
    setLoading(true);
    setError(null);
    
    try {
      const receiptData = await externalApi.generatePaymentReceipt(paymentId);
      return receiptData;
    } catch (err) {
      console.error('Failed to generate payment receipt:', err);
      setError('Could not generate receipt. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentsContext.Provider
      value={{
        payments,
        loading,
        error,
        rerunPayment,
        createPayment,
        getPaymentById,
        prepareRerunPayment,
        clearRerunPayment,
        submitPaymentToBackend,      // Enhanced function with API integration
        generatePaymentReceipt        // Enhanced function with API integration
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
};

export default PaymentsProvider; 