import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { formatWalletAddress } from '../utils/solana';
import { fetchWalletBalances } from '../utils/web3';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCopy, FaExternalLinkAlt, FaArrowUp, FaArrowDown, FaPercent, FaSync } from 'react-icons/fa';

/**
 * Displays detailed information about a wallet including:
 * - Balance information fetched directly from the blockchain
 * - Copy to clipboard functionality
 * - Link to Solana Explorer
 */
const WalletDetails = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Example yield data - replace with actual API data
  const yieldInfo = {
    apy: 5.2,
    totalDeposited: 1000,
    earnedInterest: 52,
    projectedAnnualYield: 52
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalances();
    }
  }, [publicKey, connection]);

  const fetchBalances = async () => {
    if (!publicKey || !connection) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const balances = await fetchWalletBalances(connection, publicKey.toString());
      if (balances.success) {
        setWalletBalance(balances);
      } else {
        setError(balances.error || 'Failed to fetch on-chain balances');
      }
    } catch (err) {
      console.error('Error fetching wallet balances:', err);
      setError('Failed to load wallet balances');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExplorerLink = () => {
    if (!publicKey) return '#';
    return `https://solscan.io/account/${publicKey.toString()}`;
  };

  const handleDeposit = () => {
    setShowDepositModal(true);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
  };

  const handleRefreshBalances = () => {
    fetchBalances();
  };

  if (!publicKey) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <p className="text-gray-500 text-center">Wallet not connected</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Wallet Details</h2>
        <div className="flex items-center space-x-2">
          <a 
            href={getExplorerLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-sm"
          >
            <FaExternalLinkAlt className="inline mr-1" size={12} />
            View on Explorer
          </a>
          <button 
            onClick={handleCopyAddress}
            className="text-primary hover:text-primary-dark"
            title="Copy address"
          >
            <FaCopy size={14} />
          </button>
        </div>
      </div>
      
      {/* Wallet Address */}
      <div className="mb-6">
        <span className="text-sm text-gray-500">Connected Wallet:</span>
        <div className="font-mono text-sm mt-1">
          {formatWalletAddress(publicKey.toString())}
          {copied && (
            <span className="ml-2 text-green-500 text-xs">Copied!</span>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}
      
      {/* Wallet Balances Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">On-Chain Balances</h3>
          <button 
            onClick={handleRefreshBalances}
            className="text-primary hover:text-primary-dark p-1"
            title="Refresh balances"
            disabled={isLoading}
          >
            <FaSync className={isLoading ? "animate-spin" : ""} size={14} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
            <FaSpinner className="animate-spin text-primary mr-2" /> 
            <span>Loading wallet balances...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">SOL</p>
              <p className="text-xl font-bold text-purple-600">{walletBalance?.sol?.toFixed(4) || '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">USDC</p>
              <p className="text-xl font-bold text-primary">{walletBalance?.usdc?.toFixed(2) || '0'}</p>
            </div>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Fetched directly from Solana blockchain
        </p>
      </div>
      
      {/* USDC Balance for Summary - Main Balance Display */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Balance</h3>
        <div className="text-3xl font-bold text-primary">
          {walletBalance?.usdc?.toFixed(2) || '0.00'} USDC
        </div>
      </div>

      {/* Yield Information */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaPercent className="mr-2 text-primary" /> Yield Earnings
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current APY</p>
            <p className="text-xl font-bold text-primary">{yieldInfo.apy}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Deposited</p>
            <p className="text-xl font-bold">{yieldInfo.totalDeposited} USDC</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Interest Earned</p>
            <p className="text-xl font-bold text-green-600">{yieldInfo.earnedInterest} USDC</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Projected Annual Yield</p>
            <p className="text-xl font-bold text-green-600">{yieldInfo.projectedAnnualYield} USDC</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDeposit}
          className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <FaArrowUp className="mr-2" /> Deposit
        </button>
        <button
          onClick={handleWithdraw}
          className="flex items-center justify-center px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          <FaArrowDown className="mr-2" /> Withdraw
        </button>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Deposit USDC</h3>
            <p className="text-gray-600 mb-4">
              Recommended deposit amount (80% of balance):
              <span className="block text-2xl font-bold text-primary mt-2">
                {(walletBalance?.usdc * 0.8).toFixed(2) || '0.00'} USDC
              </span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Expected annual yield at {yieldInfo.apy}% APY:
              <span className="block text-lg font-semibold text-green-600 mt-1">
                {((walletBalance?.usdc * 0.8 * yieldInfo.apy) / 100).toFixed(2) || '0.00'} USDC
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle deposit logic here
                  setShowDepositModal(false);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Withdraw USDC</h3>
            <p className="text-gray-600 mb-4">
              Available to withdraw:
              <span className="block text-2xl font-bold text-primary mt-2">
                {yieldInfo.totalDeposited} USDC
              </span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle withdraw logic here
                  setShowWithdrawModal(false);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Confirm Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDetails; 