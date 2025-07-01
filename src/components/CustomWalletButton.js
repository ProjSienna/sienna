import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaWallet, FaCopy, FaSignOutAlt, FaTimes } from 'react-icons/fa';

const CustomWalletButton = ({ className = '' }) => {
  const { publicKey, wallet, wallets, select, connect, disconnect, connecting, disconnecting } = useWallet();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [previousRoute, setPreviousRoute] = useState(null);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Persist last visited route in localStorage on every route change
  useEffect(() => {
    if (location.pathname !== '/landing') {
      localStorage.setItem('lastVisitedRoute', location.pathname);
    }
  }, [location.pathname]);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target) && walletModalVisible) {
        setWalletModalVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [walletModalVisible]);

  // Handle button click
  const handleButtonClick = async () => {
    if (!publicKey) {
      // Store current full route (pathname + search + hash) before opening wallet modal
      setPreviousRoute(location.pathname + location.search + location.hash);
      setWalletModalVisible(true);
    } else {
      setDropdownVisible(!dropdownVisible);
    }
  };

  // Handle wallet selection and connection
  const handleWalletSelect = async (walletObj) => {
    try {
      if (!walletObj) {
        console.error('Invalid wallet object:', walletObj);
        return;
      }
      
      // The actual adapter is inside the wallet object
      const walletAdapter = walletObj.adapter;
      if (!walletAdapter || !walletAdapter.name) {
        console.error('Invalid wallet adapter:', walletAdapter);
        return;
      }
      
      select(walletAdapter.name);
      await connect();
      setWalletModalVisible(false);
      
      // After login, redirect to the full previous URL if available, else home
      if (previousRoute && previousRoute !== '/landing') {
        navigate(previousRoute);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Connection error:', error);
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

  // Get wallet display name
  const getWalletName = (walletObj) => {
    if (!walletObj) return 'Unknown Wallet';
    
    // Try to get name from adapter
    if (walletObj.adapter && walletObj.adapter.name) {
      return walletObj.adapter.name;
    }
    
    // Fallback to readyState as a display name
    if (walletObj.readyState) {
      return walletObj.readyState.charAt(0).toUpperCase() + walletObj.readyState.slice(1) + ' Wallet';
    }
    
    return 'Unknown Wallet';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`font-accent px-4 py-2 rounded-xl flex items-center justify-center ${
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

      {/* Wallet Selection Modal */}
      {walletModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-elegant p-6 max-w-md w-full shadow-elegant"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-display font-semibold text-primary m-0">Select Wallet</h3>
              <button 
                onClick={() => setWalletModalVisible(false)}
                className="text-text hover:text-primary"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="space-y-2">
              {wallets && wallets.length > 0 ? (
                wallets.map((walletObj, index) => (
                  <button
                    key={`wallet-${index}-${getWalletName(walletObj)}`}
                    onClick={() => handleWalletSelect(walletObj)}
                    className="w-full text-left px-4 py-3 border border-neutral rounded-lg hover:border-primary hover:bg-background flex items-center transition-colors"
                  >
                    <span className="font-accent">{getWalletName(walletObj)}</span>
                  </button>
                ))
              ) : (
                <p className="text-text">No wallets found. Please install a Solana wallet.</p>
              )}
            </div>
            
            <p className="text-sm text-text mt-4">
              Connect with one of available wallet providers or create a new wallet.
            </p>
          </div>
        </div>
      )}

      {/* Connected Wallet Dropdown Menu */}
      {dropdownVisible && publicKey && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-elegant shadow-elegant z-10 py-2">
          <div className="px-4 py-2 border-b border-neutral">
            <p className="text-sm text-text font-accent">Connected to {wallet?.adapter?.name || 'Wallet'}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="font-mono text-sm truncate">{formatWalletAddress(publicKey)}</p>
              <button
                onClick={copyAddress}
                className="p-1 text-text hover:text-primary"
                title="Copy address"
              >
                <FaCopy size={14} />
              </button>
            </div>
          </div>
          <button
            className="w-full text-left px-4 py-2 text-red-500 hover:bg-background flex items-center font-accent"
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