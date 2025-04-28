import React, { createContext, useState, useContext, useEffect } from 'react';
import { externalApi } from '../utils/api';

const TransactionsContext = createContext();

export const useTransactions = () => useContext(TransactionsContext);

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    // Initialize from localStorage if available
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: transaction.id || Date.now().toString(),
      timestamp: transaction.timestamp || new Date().toISOString(),
      status: transaction.status || 'completed'
    };
    
    setTransactions([newTransaction, ...transactions]);
    return newTransaction;
  };

  const getTransactionsByWallet = (walletAddress) => {
    return transactions.filter(
      tx => tx.recipientWallet === walletAddress || tx.senderWallet === walletAddress
    );
  };

  const getTransactionsByBatchId = (batchId) => {
    return transactions.filter(tx => tx.batchId === batchId);
  };

  // Enhanced functions that integrate with backend APIs

  // Submit transaction to backend for monitoring/additional processing
  const submitAndAddTransaction = async (transaction) => {
    setLoading(true);
    setError(null);
    
    // First add transaction to local storage
    const newTransaction = addTransaction(transaction);
    
    try {
      // Then submit to backend API for monitoring/processing
      await externalApi.submitTransaction({
        ...newTransaction,
        clientTimestamp: new Date().toISOString()
      });
      
      return newTransaction;
    } catch (err) {
      console.error('Failed to submit transaction to backend:', err);
      setError('Transaction saved locally but failed to sync with server.');
      return newTransaction; // Still return transaction since it was added locally
    } finally {
      setLoading(false);
    }
  };

  // Generate a receipt for a batch of transactions
  const generateReceiptForBatch = async (batchId) => {
    setLoading(true);
    setError(null);
    
    try {
      const receiptData = await externalApi.generatePayrollReceipt(batchId);
      return receiptData;
    } catch (err) {
      console.error('Failed to generate receipt:', err);
      setError('Could not generate receipt. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        getTransactionsByWallet,
        getTransactionsByBatchId,
        submitAndAddTransaction,     // Enhanced function with API integration
        generateReceiptForBatch      // Enhanced function with API integration
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export default TransactionsProvider; 