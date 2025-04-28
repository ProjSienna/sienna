import React, { createContext, useState, useContext, useEffect } from 'react';
import { externalApi } from '../utils/api';
import { PublicKey } from '@solana/web3.js';

const PayeesContext = createContext();

export const usePayees = () => useContext(PayeesContext);

// Utility function to validate Solana wallet address
const validateWalletAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

// Utility function to generate a unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
};

export const PayeesProvider = ({ children }) => {
  const [payees, setPayees] = useState(() => {
    // Initialize from localStorage if available
    const savedPayees = localStorage.getItem('payees');
    return savedPayees ? JSON.parse(savedPayees) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever payees change
  useEffect(() => {
    localStorage.setItem('payees', JSON.stringify(payees));
  }, [payees]);

  const addPayee = async (newPayee) => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate unique ID
      const id = generateId();
      
      // Validate wallet address format
      if (!validateWalletAddress(newPayee.walletAddress)) {
        setError('Invalid wallet address format');
        setLoading(false);
        return false;
      }
      
      // Check if wallet already exists
      if (payees.some(payee => payee.walletAddress === newPayee.walletAddress)) {
        setError('A payee with this wallet address already exists');
        setLoading(false);
        return false;
      }
      
      // Create new payee with ID and creation timestamp
      const newPayeeWithId = {
        ...newPayee,
        id,
        createdAt: new Date().toISOString(),
      };
      
      // Add to state
      const updatedPayees = [...payees, newPayeeWithId];
      setPayees(updatedPayees);
      
      // Save to localStorage
      localStorage.setItem('payees', JSON.stringify(updatedPayees));
      
      return true;
    } catch (err) {
      console.error('Failed to add payee:', err);
      setError('Failed to add payee');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePayee = (id, updatedPayee) => {
    setPayees(payees.map(payee => payee.id === id ? { ...updatedPayee, id } : payee));
    return { ...updatedPayee, id };
  };

  const deletePayee = (id) => {
    setPayees(payees.filter(payee => payee.id !== id));
    return true;
  };

  const getPayeeByWallet = (walletAddress) => {
    return payees.find(payee => payee.walletAddress === walletAddress);
  };

  // Enhanced functions that integrate with backend APIs

  // Get wallet balance for a payee
  const getPayeeBalance = async (payeeId) => {
    const payee = payees.find(p => p.id === payeeId);
    if (!payee) return null;
    
    setLoading(true);
    try {
      const balanceData = await externalApi.getWalletBalance(payee.walletAddress);
      return balanceData;
    } catch (err) {
      console.error('Failed to get wallet balance:', err);
      setError('Could not retrieve wallet balance.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PayeesContext.Provider
      value={{
        payees,
        loading,
        error,
        addPayee,
        updatePayee,
        deletePayee,
        getPayeeByWallet,
        getPayeeBalance     // Enhanced function with API integration
      }}
    >
      {children}
    </PayeesContext.Provider>
  );
};

export default PayeesProvider; 