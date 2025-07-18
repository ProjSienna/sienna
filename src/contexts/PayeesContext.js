import React, { createContext, useState, useContext, useEffect } from 'react';
import { externalApi } from '../utils/api';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

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
  const { publicKey } = useWallet();
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
      
      // Call the API to create the payee with user wallet information
      if (publicKey) {
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
          const response = await fetch(`${apiUrl}/api/payees/with-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: newPayee.name,
              wallet_address: newPayee.walletAddress,
              user_wallet: publicKey.toString(),
              email: newPayee.email || '',
              description: newPayee.description || '',
              category: newPayee.category || 'regular',
              payment_frequency: newPayee.paymentFrequency || 'monthly',
              amount: newPayee.amount || 0,
              notes: newPayee.notes || ''
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error('API error adding payee:', errorData);
            throw new Error(errorData.message || 'Failed to add payee on server');
          }

          // Optionally get the response data if the API returns the created payee
          const payeeData = await response.json();
          console.log('Payee added successfully:', payeeData);
        } catch (apiError) {
          console.error('API call failed:', apiError);
          // Continue with local storage even if API fails
          console.log('Falling back to local storage only');
        }
      }
      
      // Add to state (local storage)
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