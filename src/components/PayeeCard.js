import React from 'react';
import { FaEdit, FaTrash, FaPaperPlane, FaUser, FaBriefcase, FaStore, FaUsers, FaHome, FaQuestion } from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';

const categoryIcons = {
  regular: <FaUser className="text-blue-500" />,
  contractor: <FaBriefcase className="text-purple-500" />,
  vendor: <FaStore className="text-green-500" />,
  friend: <FaUsers className="text-yellow-500" />,
  family: <FaHome className="text-red-500" />,
  other: <FaQuestion className="text-gray-500" />
};

const frequencyLabels = {
  once: 'One-time',
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually'
};

const PayeeCard = ({ payee, onEdit, onDelete, onPay }) => {
  if (!payee) return null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-full">
              {categoryIcons[payee.category] || categoryIcons.other}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{payee.name}</h3>
              <p className="text-sm text-gray-500">{payee.description}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(payee)} 
              className="p-1.5 text-gray-500 hover:text-primary rounded-md hover:bg-gray-100"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button 
              onClick={() => onDelete(payee.id)} 
              className="p-1.5 text-gray-500 hover:text-red-500 rounded-md hover:bg-gray-100"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Wallet:</span>
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{formatWalletAddress(payee.walletAddress)}</span>
          </div>
          
          {payee.email && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email:</span>
              <span>{payee.email}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Frequency:</span>
            <span>{frequencyLabels[payee.paymentFrequency]}</span>
          </div>
          
          {payee.amount && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Default Amount:</span>
              <span className="font-semibold">{payee.amount} USDC</span>
            </div>
          )}
        </div>
        
        <div className="mt-5">
          <button
            onClick={() => onPay(payee)}
            className="w-full py-2 px-4 bg-secondary text-dark font-medium rounded-lg flex items-center justify-center space-x-2 hover:bg-secondary/90 transition-colors"
          >
            <FaPaperPlane />
            <span>Pay Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayeeCard; 