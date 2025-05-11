import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { formatWalletAddress } from '../utils/solana';
import { fetchWalletBalances } from '../utils/web3';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCopy, FaExternalLinkAlt, FaArrowUp, FaArrowDown, FaPercent, FaSync, FaWallet } from 'react-icons/fa';

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
  
  // Yield data states
  const [yieldRates, setYieldRates] = useState(null);
  const [yieldAccount, setYieldAccount] = useState(null);
  const [isLoadingYield, setIsLoadingYield] = useState(false);
  const [yieldError, setYieldError] = useState(null);

  // Calculate derived yield values
  const yieldInfo = {
    apy: yieldRates?.current_apy || 0,
    totalDeposited: yieldAccount?.total_deposited || 0,
    earnedInterest: yieldAccount?.earned_interest || 0,
    projectedAnnualYield: yieldAccount?.projected_annual_yield || 0
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalances();
      fetchYieldData();
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

  const fetchYieldData = async () => {
    if (!publicKey) return;
    
    setIsLoadingYield(true);
    setYieldError(null);

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    
    try {
      // Fetch yield rates
      const ratesResponse = await fetch(`${apiUrl}/api/yield/rates`);
      if (!ratesResponse.ok) {
        throw new Error('Failed to fetch yield rates');
      }
      const ratesData = await ratesResponse.json();
      console.log('Yield rates response:', ratesData);
      
      // Extract the APY based on the actual API response structure
      let currentApy = 0;
      
      // Check different possible structures and extract the APY value
      if (ratesData.current_apy !== undefined) {
        // Simple flat structure
        currentApy = ratesData.current_apy;
      } else if (ratesData.protected && ratesData.protected["24HR"]) {
        // Nested structure with protected/24HR
        currentApy = ratesData.protected["24HR"].apy || ratesData.protected["24HR"];
      } else if (ratesData.apy !== undefined) {
        // Direct apy property
        currentApy = ratesData.apy;
      }
      
      // Use a structured object for consistency
      setYieldRates({
        current_apy: currentApy
      });
      
      // Fetch yield account data
      const accountResponse = await fetch(`${apiUrl}/api/yield/account?owner=${publicKey.toString()}`);
      
      if (!accountResponse.ok) {
        // If account doesn't exist yet, that's okay
        if (accountResponse.status === 404) {
          setYieldAccount({
            total_deposited: 0,
            earned_interest: 0,
            projected_annual_yield: 0
          });
        } else {
          throw new Error('Failed to fetch yield account');
        }
      } else {
        const accountData = await accountResponse.json();
        console.log('Yield account response:', accountData);
        
        // Extract the required fields directly
        const accountInfo = {
          total_deposited: accountData.totalUsdValue,
          earned_interest: accountData.totalInterestEarned,
          projected_annual_yield: 0 // This field is not provided in the new response structure
        };
        
        setYieldAccount(accountInfo);
      }
    } catch (err) {
      console.error('Error fetching yield data:', err);
      setYieldError('Failed to load yield information');
    } finally {
      setIsLoadingYield(false);
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
    fetchYieldData();
  };

  const submitDeposit = async (amount) => {
    if (!publicKey || !amount) return;
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/yield/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: publicKey.toString(),
          amount: parseFloat(amount)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process deposit');
      }
      
      // Refresh data after successful deposit
      fetchYieldData();
      fetchBalances();
      setShowDepositModal(false);
      
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Could not process deposit: ' + error.message);
    }
  };

  const submitWithdraw = async (amount) => {
    if (!publicKey || !amount) return;
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/yield/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: publicKey.toString(),
          amount: parseFloat(amount)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process withdrawal');
      }
      
      // Refresh data after successful withdrawal
      fetchYieldData();
      fetchBalances();
      setShowWithdrawModal(false);
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Could not process withdrawal: ' + error.message);
    }
  };

  if (!publicKey) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <p className="text-gray-500 text-center">Wallet not connected</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Wallet Header Section */}
      <div className="p-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        {/* Balance Display */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center p-5 bg-gray-50 rounded-lg">
              <FaSpinner className="animate-spin text-primary mr-2" />
              <span>Loading wallet balances...</span>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <h3 className="text-sm font-medium text-gray-500 mr-2">Current Balance</h3>
                  <div className="flex items-baseline ml-2">
                    <div className="text-sm font-medium text-purple-600 mr-1">
                      {walletBalance?.sol?.toFixed(4) || '0'}
                    </div>
                    <div className="text-xs font-medium text-purple-600">SOL</div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={handleRefreshBalances}
                    className="p-1.5 bg-white rounded-lg text-primary hover:bg-gray-100 transition-colors"
                    title="Refresh balances"
                    disabled={isLoading || isLoadingYield}
                  >
                    <FaSync className={(isLoading || isLoadingYield) ? "animate-spin" : ""} size={14} />
                  </button>
                  <a 
                    href={getExplorerLink()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white rounded-lg text-primary hover:bg-gray-100 transition-colors"
                    title="View on Explorer"
                  >
                    <FaExternalLinkAlt size={14} />
                  </a>
                </div>
              </div>

              <div className="flex items-baseline mb-4">
                <div className="text-4xl font-bold text-primary mr-2">
                  {walletBalance?.usdc?.toFixed(2) || '0.00'}
                </div>
                <div className="text-lg font-medium text-primary">USDC</div>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 flex items-center">
                <FaCheckCircle className="text-green-500 mr-1" size={12} />
                Verified on-chain balance via Solana RPC
              </p>
            </div>
          )}
        </div>

        {/* Yield Information */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaPercent className="mr-2 text-primary" /> Yield Earnings
          </h3>
          
          {isLoadingYield ? (
            <div className="flex items-center justify-center p-5">
              <FaSpinner className="animate-spin text-primary mr-2" />
              <span>Loading yield data...</span>
            </div>
          ) : yieldError ? (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-3 text-sm">
              {yieldError}
            </div>
          ) : (
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
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleDeposit}
            className="flex items-center justify-center px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            disabled={isLoading || isLoadingYield}
          >
            <FaArrowUp className="mr-2" /> Deposit
          </button>
          <button
            onClick={handleWithdraw}
            className="flex items-center justify-center px-4 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            disabled={isLoading || isLoadingYield || !yieldInfo.totalDeposited}
          >
            <FaArrowDown className="mr-2" /> Withdraw
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Deposit USDC</h3>
            
            {yieldRates && (
              <p className="text-sm text-gray-600 mb-4">
                Current APY: <span className="font-bold text-primary">{yieldRates.current_apy}%</span>
              </p>
            )}
            
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
                onClick={() => submitDeposit((walletBalance?.usdc * 0.8).toFixed(2))}
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
                onClick={() => submitWithdraw(yieldInfo.totalDeposited)}
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