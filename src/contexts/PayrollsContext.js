import React, { createContext, useState, useContext, useEffect } from 'react';
import { externalApi } from '../utils/api';

const PayrollsContext = createContext();

export const usePayrolls = () => useContext(PayrollsContext);

export const PayrollsProvider = ({ children }) => {
  const [payrolls, setPayrolls] = useState(() => {
    // Initialize from localStorage if available
    const savedPayrolls = localStorage.getItem('payrolls');
    return savedPayrolls ? JSON.parse(savedPayrolls) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rerunPayroll, setRerunPayroll] = useState(null);

  // Save to localStorage whenever payrolls change
  useEffect(() => {
    localStorage.setItem('payrolls', JSON.stringify(payrolls));
  }, [payrolls]);

  // Create a new payroll
  const createPayroll = (payrollData) => {
    const newPayroll = {
      ...payrollData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    setPayrolls([newPayroll, ...payrolls]);
    return newPayroll;
  };

  // Get a payroll by ID
  const getPayrollById = (id) => {
    return payrolls.find(payroll => payroll.id === id);
  };

  // Handle rerunning a payroll
  const prepareRerunPayroll = (payrollName, originalName, recipients) => {
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
    const suggestedName = `${payrollName} - ${formattedDate} ${formattedTime}`;
    
    const payrollData = {
      name: suggestedName,
      originalName: originalName || payrollName,
      recipients
    };
    
    setRerunPayroll(payrollData);
    
    // Also save to localStorage as a backup
    localStorage.setItem('rerunPayroll', JSON.stringify(payrollData));
    
    return payrollData;
  };

  // Clear the rerun payroll data
  const clearRerunPayroll = () => {
    setRerunPayroll(null);
    localStorage.removeItem('rerunPayroll');
  };

  // Check if there's a rerun payroll in localStorage on mount
  useEffect(() => {
    const storedRerunPayroll = localStorage.getItem('rerunPayroll');
    if (storedRerunPayroll) {
      try {
        setRerunPayroll(JSON.parse(storedRerunPayroll));
      } catch (error) {
        console.error('Error parsing rerun payroll data:', error);
        localStorage.removeItem('rerunPayroll');
      }
    }
  }, []);

  // Enhanced functions that integrate with backend APIs

  // Submit a completed payroll to the backend for record keeping
  const submitPayrollToBackend = async (payrollId) => {
    setLoading(true);
    setError(null);
    
    try {
      const payroll = getPayrollById(payrollId);
      if (!payroll) {
        setError('Payroll not found');
        return false;
      }
      
      // Submit to backend
      await externalApi.submitTransaction({
        type: 'payroll',
        payrollId: payroll.id,
        payrollName: payroll.name,
        timestamp: payroll.timestamp,
        recipientCount: payroll.recipients?.length || 0,
        totalAmount: payroll.totalAmount,
        status: payroll.status
      });
      
      return true;
    } catch (err) {
      console.error('Failed to submit payroll to backend:', err);
      setError('Payroll saved locally but failed to sync with server.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Generate a receipt for a payroll
  const generatePayrollReceipt = async (payrollId) => {
    setLoading(true);
    setError(null);
    
    try {
      const receiptData = await externalApi.generatePayrollReceipt(payrollId);
      return receiptData;
    } catch (err) {
      console.error('Failed to generate payroll receipt:', err);
      setError('Could not generate receipt. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PayrollsContext.Provider
      value={{
        payrolls,
        loading,
        error,
        rerunPayroll,
        createPayroll,
        getPayrollById,
        prepareRerunPayroll,
        clearRerunPayroll,
        submitPayrollToBackend,      // Enhanced function with API integration
        generatePayrollReceipt        // Enhanced function with API integration
      }}
    >
      {children}
    </PayrollsContext.Provider>
  );
};

export default PayrollsProvider; 