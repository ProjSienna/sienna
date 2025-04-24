import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useTransactions } from '../contexts/TransactionsContext';
import { sendUSDC, formatWalletAddress } from '../utils/solana';
import { FaCoins, FaSpinner } from 'react-icons/fa';

const PaymentForm = ({ payee, onSuccess, onCancel }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { addTransaction } = useTransactions();
  
  const [amount, setAmount] = useState(payee?.amount || '');
  const [memo, setMemo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (payee?.amount) {
      setAmount(payee.amount.toString());
    }
  }, [payee]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,6})?$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleCancel = () => {
    // Clear form state before closing
    setAmount(payee?.amount?.toString() || '');
    setMemo('');
    setError('');
    
    // Call the onCancel callback if provided
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!publicKey) {
        throw new WalletNotConnectedError();
      }

      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      setIsProcessing(true);

      // Create transaction
      const tx = await sendUSDC({
        connection,
        fromWallet: publicKey.toString(),
        toWallet: payee.walletAddress,
        amount: parseFloat(amount),
      });

      // Send transaction
      const signature = await sendTransaction(tx, connection);
      console.log('Transaction sent with signature', signature);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      console.log('Transaction confirmed');

      // Add to transaction history
      const newTransaction = addTransaction({
        amount: parseFloat(amount),
        memo: memo || `Payment to ${payee.name}`,
        recipientName: payee.name,
        recipientWallet: payee.walletAddress,
        senderWallet: publicKey.toString(),
        signature,
      });
      
      // Call success callback
      onSuccess?.(newTransaction);
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">
        Payment to {payee?.name}
      </h2>
      
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Recipient:</span>
          <span className="font-medium">{payee?.name}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600">Wallet Address:</span>
          <span className="font-mono">{formatWalletAddress(payee?.walletAddress)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="amount">
            Amount (USDC)*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCoins className="text-gray-400" />
            </div>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
              disabled={isProcessing}
            />
          </div>
        </div>
        
        {/* Memo */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="memo">
            Memo / Description
          </label>
          <input
            type="text"
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="What's this payment for? (optional)"
            disabled={isProcessing}
          />
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-dark bg-secondary rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center space-x-2"
            disabled={isProcessing || !publicKey}
          >
            {isProcessing ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FaCoins />
                <span>Send Payment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm; 