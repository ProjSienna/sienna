import React, { createContext, useState, useContext, useEffect } from 'react';

const PayeesContext = createContext();

export const usePayees = () => useContext(PayeesContext);

export const PayeesProvider = ({ children }) => {
  const [payees, setPayees] = useState(() => {
    // Initialize from localStorage if available
    const savedPayees = localStorage.getItem('payees');
    return savedPayees ? JSON.parse(savedPayees) : [];
  });

  // Save to localStorage whenever payees change
  useEffect(() => {
    localStorage.setItem('payees', JSON.stringify(payees));
  }, [payees]);

  const addPayee = (newPayee) => {
    setPayees([...payees, { ...newPayee, id: Date.now().toString() }]);
  };

  const updatePayee = (id, updatedPayee) => {
    setPayees(payees.map(payee => payee.id === id ? { ...updatedPayee, id } : payee));
  };

  const deletePayee = (id) => {
    setPayees(payees.filter(payee => payee.id !== id));
  };

  const getPayeeByWallet = (walletAddress) => {
    return payees.find(payee => payee.walletAddress === walletAddress);
  };

  return (
    <PayeesContext.Provider
      value={{
        payees,
        addPayee,
        updatePayee,
        deletePayee,
        getPayeeByWallet
      }}
    >
      {children}
    </PayeesContext.Provider>
  );
};

export default PayeesProvider; 