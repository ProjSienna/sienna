import React, { useState } from 'react';
import { FaArrowUp, FaLayerGroup, FaChevronDown, FaChevronUp, FaExternalLinkAlt, FaUsers, FaRedo } from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';
import { useWallet } from '@solana/wallet-adapter-react';
import TransactionCard from './TransactionCard';

const BatchTransactionCard = ({ batchId, transactions, onRerunPayroll }) => {
  const { publicKey } = useWallet();
  const [expanded, setExpanded] = useState(false);
  
  // All batch transactions should have the same timestamp, signature, sender
  const firstTx = transactions[0];
  const timestamp = firstTx.timestamp;
  const signature = firstTx.signature;
  
  // Get payroll name from the batch ID or memo
  const getPayrollName = () => {
    // First strip out the timestamp from our uniquePayrollId format
    if (batchId.includes('_batch_')) {
      // Format is either:
      // "PayrollName_timestamp_batch_X" (new format with integrated timestamp)
      // or "PayrollName_batch_X" (older format)
      
      const parts = batchId.split('_batch_')[0].split('_');
      
      // Check if the second-to-last part might be a timestamp (numeric and long)
      const potentialTimestamp = parts[parts.length - 1];
      if (potentialTimestamp && /^\d{13,}$/.test(potentialTimestamp)) {
        // This looks like a timestamp, so exclude it from the payroll name
        return parts.slice(0, -1).join('_').trim();
      }
      
      // Otherwise just return the whole first part
      return batchId.split('_batch_')[0].trim();
    }
    
    // Try to extract from memo
    const memo = firstTx.memo || '';
    if (memo.includes(':')) {
      return memo.split(':')[0].trim();
    }
    
    return batchId;
  };
  
  const payrollName = getPayrollName();
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get total amount
  const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  
  // Get recipient count
  const recipientCount = transactions.length;
  
  // Get Solana Explorer URL
  const getExplorerLink = (signature) => {
    return `https://solscan.io/tx/${signature}`;
  };
  
  // Handle rerun payroll
  const handleRerunPayroll = () => {
    if (onRerunPayroll) {
      // Extract recipient data from transactions
      const recipients = transactions.map(tx => ({
        name: tx.recipientName,
        walletAddress: tx.recipientWallet,
        amount: tx.amount
      }));
      
      onRerunPayroll(payrollName, recipients);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow border border-gray-100">
      {/* Summary View */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-primary bg-opacity-10">
            <FaLayerGroup className="text-primary" />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 flex items-center">
              <span className="mr-2">{payrollName}</span>
              <button 
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-primary hover:text-primary-dark p-1"
                aria-label={expanded ? "Collapse details" : "Expand details"}
              >
                {expanded ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </h3>
            <p className="text-sm text-gray-500 flex items-center">
              <FaUsers className="mr-1" />
              <span>{recipientCount} {recipientCount === 1 ? 'recipient' : 'recipients'}</span>
            </p>
            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
              <span>{formatDate(timestamp)}</span>
              <span>•</span>
              <a 
                href={getExplorerLink(signature)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary flex items-center hover:underline"
              >
                <span>View on Explorer</span>
                <FaExternalLinkAlt className="ml-1 text-xs" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="font-semibold text-red-500">
            -{totalAmount.toFixed(2)} USDC
          </div>
          
          <button
            onClick={handleRerunPayroll}
            className="mt-2 px-3 py-1 bg-primary text-white text-xs rounded flex items-center hover:bg-primary-dark transition-colors"
            aria-label="Run this payroll again"
          >
            <FaRedo className="mr-1" />
            Run Again
          </button>
        </div>
      </div>
      
      {/* Expanded Details View */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Payment Details - {transactions.length} {transactions.length === 1 ? 'recipient' : 'recipients'} in this batch
          </h4>
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={tx.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium flex items-center">
                      <span className="bg-primary text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs mr-2">
                        {index + 1}
                      </span>
                      {tx.recipientName || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">{formatWalletAddress(tx.recipientWallet)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-500">{tx.amount} USDC</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTransactionCard; 