import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { usePayees } from '../contexts/PayeesContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { sendUSDC, sendBatchUSDC, formatWalletAddress } from '../utils/solana';
import { FaCheckCircle, FaTimesCircle, FaWallet, FaSpinner, FaCoins, FaArrowLeft } from 'react-icons/fa';

const PayrollPage = () => {
  const navigate = useNavigate();
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
  const [batchProgress, setBatchProgress] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  
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
    
    // Initialize all payees to 'processing' state
    for (const payeeId of selectedPayees) {
      newProcessingStates[payeeId] = 'processing';
    }
    setProcessingStates(newProcessingStates);
    
    try {
      // Prepare recipients array for batch processing
      const recipients = selectedPayees.map(payeeId => {
        const payee = payees.find(p => p.id === payeeId);
        const amount = customAmounts[payeeId] !== undefined 
          ? parseFloat(customAmounts[payeeId]) 
          : payee.amount;
          
        return {
          id: payeeId,
          name: payee.name,
          walletAddress: payee.walletAddress,
          amount
        };
      });
      
      // Create batch transactions
      const batchTransactions = await sendBatchUSDC({
        connection,
        fromWallet: publicKey.toString(),
        recipients,
        maxInstructions: 5 // Process 5 payments per transaction for optimal performance
      });
      
      setTotalBatches(batchTransactions.length);
      
      // Process each batch transaction
      for (let i = 0; i < batchTransactions.length; i++) {
        setBatchProgress(i + 1);
        
        const transaction = batchTransactions[i];
        const batchRecipients = transaction.recipients;
        
        try {
          // Send and confirm the transaction
          const signature = await sendTransaction(transaction, connection);
          await connection.confirmTransaction(signature, 'confirmed');
          
          // Update the status for each recipient in this batch
          for (const recipient of batchRecipients) {
            // Add to transaction history
            addTransaction({
              amount: recipient.amount,
              memo: `${payrollName}: Payment to ${recipient.name}`,
              recipientName: recipient.name,
              recipientWallet: recipient.walletAddress,
              senderWallet: publicKey.toString(),
              signature,
              batchId: `${payrollName}_batch_${i + 1}`,
            });
            
            // Update processing status
            newProcessingStates[recipient.id] = 'completed';
            newCompletedPayments[recipient.id] = true;
          }
          
        } catch (err) {
          console.error('Batch payment error:', err);
          
          // Mark all recipients in this failed batch as errors
          for (const recipient of batchRecipients) {
            newProcessingStates[recipient.id] = 'error';
            setErrors(prev => ({
              ...prev,
              [recipient.id]: err.message || 'Failed to process payment'
            }));
          }
        }
        
        // Update UI after each batch
        setProcessingStates({...newProcessingStates});
        setCompletedPayments({...newCompletedPayments});
      }
      
    } catch (err) {
      console.error('Payroll process error:', err);
      setErrors(prev => ({
        ...prev,
        general: err.message || 'Failed to process payroll'
      }));
    } finally {
      setIsSubmitting(false);
      setBatchProgress(0);
      setTotalBatches(0);
    }
  };

  // Legacy individual processing method (fallback if needed)
  const processPayrollIndividually = async () => {
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

  const handleBackClick = () => {
    navigate('/payroll');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={handleBackClick}
          className="flex items-center text-primary hover:text-primary-dark font-medium"
        >
          <FaArrowLeft className="mr-2" /> Back to Payments Management
        </button>
      </div>

      {/* Wallet Not Connected Message */}
      {!publicKey && (
        <div className="text-center py-16">
          <FaWallet className="text-6xl text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 mb-8">
            You need to connect your wallet to run payments payments.
          </p>
        </div>
      )}

      {/* Payroll Form */}
      {publicKey && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Run Payment</h1>
          
          {isPayrollComplete() ? (
            <div className="text-center py-8">
              <FaCheckCircle className="text-6xl text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Complete!</h2>
              <p className="text-lg text-gray-600 mb-8">
                All payments have been successfully processed.
              </p>
              <button
                onClick={resetPayroll}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Start New Payment
              </button>
            </div>
          ) : (
            <>
              {/* Payroll Name */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="payrollName">
                  Payment Name*
                </label>
                <input
                  type="text"
                  id="payrollName"
                  value={payrollName}
                  onChange={(e) => setPayrollName(e.target.value)}
                  className={`w-full p-3 border rounded-lg ${
                    errors.payrollName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., June 2025 Payroll"
                  disabled={isSubmitting}
                />
                {errors.payrollName && (
                  <p className="text-red-500 text-xs mt-1">{errors.payrollName}</p>
                )}
              </div>
              
              {/* Batch Progress Indicator */}
              {totalBatches > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Processing transactions
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {batchProgress} of {totalBatches} batches
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${(batchProgress / totalBatches) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
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
                    disabled={isSubmitting}
                    className="text-sm text-primary hover:underline"
                  >
                    {selectedPayees.length === payees.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
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
                    {payees.map((payee) => (
                      <tr key={payee.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedPayees.includes(payee.id)}
                            onChange={() => togglePayee(payee.id)}
                            disabled={isSubmitting}
                            className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payee.name}</div>
                          {payee.note && (
                            <div className="text-xs text-gray-500">{payee.note}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 font-mono">
                            {formatWalletAddress(payee.walletAddress)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={customAmounts[payee.id] !== undefined ? customAmounts[payee.id] : (payee.amount || '')}
                            onChange={(e) => handleCustomAmountChange(payee.id, e.target.value)}
                            disabled={!selectedPayees.includes(payee.id) || isSubmitting}
                            className={`w-24 p-1 border rounded ${
                              errors[payee.id] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[payee.id] && (
                            <p className="text-red-500 text-xs mt-1">{errors[payee.id]}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {processingStates[payee.id] === 'processing' && (
                            <span className="inline-flex items-center text-yellow-600">
                              <FaSpinner className="animate-spin mr-1" />
                              Processing
                            </span>
                          )}
                          {processingStates[payee.id] === 'completed' && (
                            <span className="inline-flex items-center text-green-600">
                              <FaCheckCircle className="mr-1" />
                              Completed
                            </span>
                          )}
                          {processingStates[payee.id] === 'error' && (
                            <span className="inline-flex items-center text-red-600">
                              <FaTimesCircle className="mr-1" />
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium">
                        Total Amount:
                      </td>
                      <td className="px-6 py-3 text-left text-sm font-bold">
                        {totalAmount.toFixed(2)} USDC
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={processPayroll}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCoins className="mr-2" />
                      Run Payment
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