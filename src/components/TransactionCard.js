import React from 'react';
import { FaArrowUp, FaArrowDown, FaExternalLinkAlt } from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';
import { useWallet } from '@solana/wallet-adapter-react';

const TransactionCard = ({ transaction }) => {
  const { publicKey } = useWallet();
  const isOutgoing = publicKey && transaction.senderWallet === publicKey.toString();
  
  // Extract payroll name from memo if available
  const getPayrollName = () => {
    if (!transaction.memo) return null;
    
    // Memos usually have format "PayrollName: Payment to Recipient"
    const colonIndex = transaction.memo.indexOf(':');
    if (colonIndex > 0) {
      return transaction.memo.substring(0, colonIndex).trim();
    }
    
    // If memo doesn't have a colon, look for batch ID pattern
    if (transaction.batchId && transaction.batchId.includes('_batch_')) {
      const parts = transaction.batchId.split('_batch_')[0].split('_');
      
      // Check if the second-to-last part might be a timestamp (numeric and long)
      const potentialTimestamp = parts[parts.length - 1];
      if (potentialTimestamp && /^\d{13,}$/.test(potentialTimestamp)) {
        // This looks like a timestamp, so exclude it from the payroll name
        return parts.slice(0, -1).join('_').trim();
      }
      
      return transaction.batchId.split('_batch_')[0].trim();
    }
    
    return null;
  };
  
  // Format date to local date and time - compact format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' • ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get Solana Explorer URL for the transaction
  const getExplorerLink = (signature) => {
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
  };

  const payrollName = getPayrollName();

  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow p-3">
      <div className="flex items-start gap-3">
        {/* Left: Icon */}
        <div className={`p-2 rounded-full flex-shrink-0 ${isOutgoing ? 'bg-red-100' : 'bg-green-100'}`}>
          {isOutgoing ? (
            <FaArrowUp className="text-red-500" />
          ) : (
            <FaArrowDown className="text-green-500" />
          )}
        </div>
        
        {/* Center: Transaction details */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Recipient/Sender */}
          <div className="flex justify-between items-start mb-1">
            <div>
              <div className="flex items-baseline">
                <span className="text-gray-600 mr-1">{isOutgoing ? 'To:' : 'From:'}</span>
                <span className="text-lg font-semibold text-gray-800">{transaction.recipientName || 'Unknown'}</span>
              </div>
              {payrollName && (
                <p className="text-sm text-gray-500">
                  Payroll: {payrollName}
                </p>
              )}
            </div>
            <div className={`font-semibold text-lg ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
              {isOutgoing ? '-' : '+'}{transaction.amount} USDC
            </div>
          </div>
          
          {/* Bottom row: Address and Date */}
          <div className="flex justify-between items-center text-sm mt-2">
            <div className="text-gray-600">
              <span className="bg-gray-100 px-2 py-0.5 rounded font-mono">
                {formatWalletAddress(isOutgoing ? transaction.recipientWallet : transaction.senderWallet)}
              </span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <span className="text-gray-500 mr-2">{formatDate(transaction.timestamp)}</span>
              <a 
                href={getExplorerLink(transaction.signature)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary flex items-center hover:underline"
              >
                View
                <FaExternalLinkAlt className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard; 