import React from 'react';
import { FaEdit, FaTrash, FaPaperPlane, FaUser, FaBriefcase, FaStore, FaUsers, FaHome, FaQuestion, FaFileInvoiceDollar } from 'react-icons/fa';
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

import { useState, useRef } from 'react';

const PayeeCard = ({ payee, onEdit, onDelete, onPay, onInvoice }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const cardRef = useRef(null);
  
  if (!payee) return null;
  
  const handleAction = (action) => (e) => {
    e.stopPropagation();
    action(payee);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this payee?')) {
      onDelete(payee.id);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onEdit(payee);
  };

  return (
    <div 
      ref={cardRef}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 relative"
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
      onDoubleClick={handleDoubleClick}
    >
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
          
          <div className="relative">
            <button
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Actions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 top-full mt-1 z-50 bg-white shadow-lg rounded-lg p-1 border border-gray-200 min-w-[200px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleAction(onPay)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
                >
                  <FaPaperPlane className="h-4 w-4 text-blue-500" />
                  <span>Pay Now</span>
                </button>
                <button
                  onClick={handleAction(onInvoice)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center space-x-2"
                >
                  <FaFileInvoiceDollar className="h-4 w-4 text-green-500" />
                  <span>Create Invoice</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="flex space-x-2 px-3 py-1">
                  <button 
                    onClick={handleAction(onEdit)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50"
                    title="Edit"
                  >
                    <FaEdit className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    title="Delete"
                  >
                    <FaTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Wallet:</span>
            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
              {formatWalletAddress(payee.walletAddress)}
            </span>
          </div>
            
          {payee.email && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-sm text-gray-700 truncate max-w-[180px]" title={payee.email}>
                {payee.email}
              </span>
            </div>
          )}
        </div>
          
        {/* Hidden details that will be shown in edit panel */}
        <div className="hidden">
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
        

      </div>
    </div>
  );
};

export default PayeeCard; 