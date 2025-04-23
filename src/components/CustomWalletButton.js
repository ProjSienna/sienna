import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaWallet, FaCopy, FaSignOutAlt } from 'react-icons/fa';

const CustomWalletButton = ({ className = '' }) => {
  const { publicKey, wallet, connect, disconnect, connecting, disconnecting } = useWallet();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);

  // Format wallet address for display
  const formatWalletAddress = (address) => {
    if (!address) return '';
    const addressStr = address.toString();
    return `${addressStr.slice(0, 4)}...${addressStr.slice(-4)}`;
  };

  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      // You could add a toast notification here
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle button click
  const handleButtonClick = async () => {
    if (!publicKey) {
      try {
        await connect();
      } catch (error) {
        console.error('Connection error:', error);
      }
    } else {
      setDropdownVisible(!dropdownVisible);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setDropdownVisible(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`px-4 py-2 rounded-xl flex items-center justify-center ${
          publicKey ? 'bg-secondary text-dark' : 'bg-primary text-white'
        } hover:opacity-90 transition-colors ${className}`}
        onClick={handleButtonClick}
        disabled={connecting || disconnecting}
      >
        <FaWallet className="mr-2" />
        {connecting ? (
          'Connecting...'
        ) : disconnecting ? (
          'Disconnecting...'
        ) : publicKey ? (
          formatWalletAddress(publicKey)
        ) : (
          'Connect Wallet'
        )}
      </button>

      {/* Dropdown Menu */}
      {dropdownVisible && publicKey && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-10 py-2">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-500">Connected to {wallet?.adapter?.name || 'Wallet'}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="font-mono text-sm truncate">{formatWalletAddress(publicKey)}</p>
              <button
                onClick={copyAddress}
                className="p-1 text-gray-500 hover:text-primary"
                title="Copy address"
              >
                <FaCopy size={14} />
              </button>
            </div>
          </div>
          <button
            className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-50 flex items-center"
            onClick={handleDisconnect}
          >
            <FaSignOutAlt className="mr-2" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomWalletButton; 