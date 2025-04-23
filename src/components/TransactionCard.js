import React from 'react';
import { FaArrowUp, FaArrowDown, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';
import { useWallet } from '@solana/wallet-adapter-react';

const TransactionCard = ({ transaction }) => {
  const { publicKey } = useWallet();
  const isOutgoing = publicKey && transaction.senderWallet === publicKey.toString();
  
  // Format date to local date and time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get Solana Explorer URL for the transaction
  const getExplorerLink = (signature) => {
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isOutgoing ? 'bg-red-100' : 'bg-green-100'}`}>
            {isOutgoing ? (
              <FaArrowUp className="text-red-500" />
            ) : (
              <FaArrowDown className="text-green-500" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">
              {isOutgoing ? `To: ${transaction.recipientName || 'Unknown'}` : `From: ${transaction.senderName || 'Unknown'}`}
            </h3>
            <p className="text-sm text-gray-500">
              {transaction.memo || (isOutgoing ? 'Sent USDC' : 'Received USDC')}
            </p>
            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
              <span>{formatDate(transaction.timestamp)}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <FaCheck className="text-accent" />
                <span>{transaction.status}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className={`font-semibold ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
            {isOutgoing ? '-' : '+'}{transaction.amount} USDC
          </div>
          
          <div className="text-xs mt-2">
            <a 
              href={getExplorerLink(transaction.signature)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary flex items-center hover:underline"
            >
              <span>View</span>
              <FaExternalLinkAlt className="ml-1 text-xs" />
            </a>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
        {isOutgoing ? (
          <div className="flex justify-between">
            <span>To:</span>
            <span className="font-mono">{formatWalletAddress(transaction.recipientWallet)}</span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span>From:</span>
            <span className="font-mono">{formatWalletAddress(transaction.senderWallet)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionCard; 