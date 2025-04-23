import React, { createContext, useState, useContext, useEffect } from 'react';

const TransactionsContext = createContext();

export const useTransactions = () => useContext(TransactionsContext);

export const TransactionsProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    // Initialize from localStorage if available
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  // Save to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    setTransactions([newTransaction, ...transactions]);
    return newTransaction;
  };

  const getTransactionsByWallet = (walletAddress) => {
    return transactions.filter(
      tx => tx.recipientWallet === walletAddress || tx.senderWallet === walletAddress
    );
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        addTransaction,
        getTransactionsByWallet
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export default TransactionsProvider; 