import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { usePayees } from '../contexts/PayeesContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { sendUSDC, formatWalletAddress } from '../utils/solana';
import { FaCheckCircle, FaTimesCircle, FaWallet, FaSpinner, FaCoins } from 'react-icons/fa';

const PayrollPage = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { payees } = usePayees();
  const { addTransaction } = useTransactions();
  
  const [selectedPayees, setSelectedPayees] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});
  const [payrollName, setPayrollName] = useState('');
  const [processingStates, setProcessingStates] = useState({});
  const [completedPayments, setCompletedPayments] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  
  useEffect(() => {
    // Calculate total amount whenever selected payees or custom amounts change
    let total = 0;
    selectedPayees.forEach(payeeId => {
      const payee = payees.find(p => p.id === payeeId);
      if (payee) {
        const amount = customAmounts[payeeId] !== undefined 
          ? parseFloat(customAmounts[payeeId]) || 0 
          : (payee.amount || 0);
        total += amount;
      }
    });
    setTotalAmount(total);
  }, [selectedPayees, customAmounts, payees]);

  const togglePayee = (payeeId) => {
    if (selectedPayees.includes(payeeId)) {
      setSelectedPayees(selectedPayees.filter(id => id !== payeeId));
    } else {
      setSelectedPayees([...selectedPayees, payeeId]);
    }
  };

  const selectAllPayees = () => {
    if (selectedPayees.length === payees.length) {
      // Deselect all
      setSelectedPayees([]);
    } else {
      // Select all
      setSelectedPayees(payees.map(payee => payee.id));
    }
  };

  const handleCustomAmountChange = (payeeId, value) => {
    if (value === '' || /^\d+(\.\d{0,6})?$/.test(value)) {
      setCustomAmounts({
        ...customAmounts,
        [payeeId]: value
      });
      
      // Clear error if exists
      if (errors[payeeId]) {
        setErrors({
          ...errors,
          [payeeId]: null
        });
      }
    }
  };

  const validatePayroll = () => {
    let isValid = true;
    const newErrors = {};
    
    if (!payrollName.trim()) {
      newErrors.payrollName = 'Payroll name is required';
      isValid = false;
    }
    
    if (selectedPayees.length === 0) {
      newErrors.general = 'Please select at least one payee';
      isValid = false;
    }
    
    selectedPayees.forEach(payeeId => {
      const payee = payees.find(p => p.id === payeeId);
      
      if (payee) {
        const amount = customAmounts[payeeId] !== undefined 
          ? parseFloat(customAmounts[payeeId]) 
          : payee.amount;
        
        if (!amount || amount <= 0) {
          newErrors[payeeId] = 'Invalid amount';
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const processPayroll = async () => {
    if (!validatePayroll() || !publicKey) return;
    
    setIsSubmitting(true);
    const newProcessingStates = {};
    const newCompletedPayments = {};
    
    for (const payeeId of selectedPayees) {
      newProcessingStates[payeeId] = 'processing';
    }
    
    setProcessingStates(newProcessingStates);
    
    for (const payeeId of selectedPayees) {
      try {
        const payee = payees.find(p => p.id === payeeId);
        if (!payee) continue;
        
        const amount = customAmounts[payeeId] !== undefined 
          ? parseFloat(customAmounts[payeeId]) 
          : payee.amount;
        
        // Create transaction
        const tx = await sendUSDC({
          connection,
          fromWallet: publicKey.toString(),
          toWallet: payee.walletAddress,
          amount,
        });
        
        // Send transaction
        const signature = await sendTransaction(tx, connection);
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');
        
        // Add to transaction history
        addTransaction({
          amount,
          memo: `${payrollName}: Payment to ${payee.name}`,
          recipientName: payee.name,
          recipientWallet: payee.walletAddress,
          senderWallet: publicKey.toString(),
          signature,
        });
        
        newProcessingStates[payeeId] = 'completed';
        newCompletedPayments[payeeId] = true;
        
      } catch (err) {
        console.error('Payment error for payee', payeeId, err);
        newProcessingStates[payeeId] = 'error';
        setErrors(prev => ({
          ...prev,
          [payeeId]: err.message || 'Failed to process payment'
        }));
      }
      
      setProcessingStates({...newProcessingStates});
      setCompletedPayments({...newCompletedPayments});
    }
    
    setIsSubmitting(false);
  };

  const isPayrollComplete = () => {
    if (selectedPayees.length === 0) return false;
    return selectedPayees.every(payeeId => completedPayments[payeeId]);
  };

  const resetPayroll = () => {
    setSelectedPayees([]);
    setCustomAmounts({});
    setPayrollName('');
    setProcessingStates({});
    setCompletedPayments({});
    setErrors({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wallet Not Connected Message */}
      {!publicKey && (
        <div className="text-center py-16">
          <FaWallet className="text-6xl text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 mb-8">
            You need to connect your wallet to run payroll payments.
          </p>
        </div>
      )}

      {/* Payroll Form */}
      {publicKey && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Run Payroll</h1>
          
          {isPayrollComplete() ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-6xl text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payroll Complete!</h2>
              <p className="text-lg text-gray-600 mb-8">
                All payments have been successfully processed.
              </p>
              <button
                onClick={resetPayroll}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Start New Payroll
              </button>
            </div>
          ) : (
            <>
              {/* Payroll Name */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="payrollName">
                  Payroll Name*
                </label>
                <input
                  type="text"
                  id="payrollName"
                  value={payrollName}
                  onChange={(e) => setPayrollName(e.target.value)}
                  className={`w-full p-3 border rounded-lg ${
                    errors.payrollName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., June 2023 Payroll"
                  disabled={isSubmitting}
                />
                {errors.payrollName && (
                  <p className="text-red-500 text-xs mt-1">{errors.payrollName}</p>
                )}
              </div>
              
              {/* General Error */}
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {errors.general}
                </div>
              )}
              
              {/* Payees Table */}
              <div className="mb-6 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Select Payees</h2>
                  <button
                    onClick={selectAllPayees}
                    className="text-primary hover:underline text-sm font-medium"
                    disabled={isSubmitting}
                  >
                    {selectedPayees.length === payees.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                {payees.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">You haven't added any payees yet.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Select
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payee
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Wallet Address
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount (USDC)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payees.map(payee => (
                        <tr key={payee.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedPayees.includes(payee.id)}
                              onChange={() => togglePayee(payee.id)}
                              disabled={isSubmitting}
                              className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{payee.name}</div>
                            {payee.description && (
                              <div className="text-sm text-gray-500">{payee.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">
                            {formatWalletAddress(payee.walletAddress)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={customAmounts[payee.id] !== undefined ? customAmounts[payee.id] : (payee.amount || '')}
                              onChange={(e) => handleCustomAmountChange(payee.id, e.target.value)}
                              disabled={!selectedPayees.includes(payee.id) || isSubmitting}
                              className={`w-28 p-2 border rounded ${
                                errors[payee.id] ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="0.00"
                            />
                            {errors[payee.id] && (
                              <p className="text-red-500 text-xs mt-1">{errors[payee.id]}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {processingStates[payee.id] === 'processing' && (
                              <div className="flex items-center text-yellow-500">
                                <FaSpinner className="animate-spin mr-2" />
                                <span>Processing...</span>
                              </div>
                            )}
                            {processingStates[payee.id] === 'completed' && (
                              <div className="flex items-center text-accent">
                                <FaCheckCircle className="mr-2" />
                                <span>Completed</span>
                              </div>
                            )}
                            {processingStates[payee.id] === 'error' && (
                              <div className="flex items-center text-red-500">
                                <FaTimesCircle className="mr-2" />
                                <span>Failed</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Summary and Submit */}
              <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="mb-4 md:mb-0">
                  <div className="text-gray-600">Total amount to be paid:</div>
                  <div className="text-2xl font-bold flex items-center text-gray-800">
                    <FaCoins className="text-secondary mr-2" />
                    {totalAmount.toFixed(2)} USDC
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    To {selectedPayees.length} {selectedPayees.length === 1 ? 'payee' : 'payees'}
                  </div>
                </div>
                
                <button
                  onClick={processPayroll}
                  disabled={isSubmitting || selectedPayees.length === 0}
                  className="px-6 py-3 bg-secondary text-dark font-medium rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing Payroll...
                    </>
                  ) : (
                    <>
                      <FaCoins className="mr-2" />
                      Run Payroll
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PayrollPage; 