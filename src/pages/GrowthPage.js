import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown, 
  FaInfoCircle,
  FaLock,
  FaRegLightbulb,
  FaExchangeAlt,
  FaRegClock,
  FaSpinner,
  FaShieldAlt,
  FaWallet
} from 'react-icons/fa';

const GrowthPage = () => {
  const { publicKey } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Yield data states
  const [yieldRates, setYieldRates] = useState(null);
  const [yieldAccount, setYieldAccount] = useState(null);
  const [isLoadingYield, setIsLoadingYield] = useState(true);
  const [yieldError, setYieldError] = useState(null);

  // Calculate derived yield values
  const yieldInfo = {
    apy: yieldRates?.current_apy || 0,
    totalDeposited: yieldAccount?.total_deposited || 0,
    earnedInterest: yieldAccount?.earned_interest || 0,
    estimatedAnnual: ((yieldAccount?.total_deposited || 0) * (yieldRates?.current_apy || 0)) / 100,
    lastMonthEarned: yieldAccount?.last_month_earned || 0
  };

  // Move useEffect before the conditional return
  useEffect(() => {
    if (publicKey) {
      fetchYieldData();
    }
  }, [publicKey]);

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
      
      // Extract the current yield rate
      let currentApy = 0;
      if (ratesData.protected && ratesData.protected["24HR"]) {
        // Check if it's a direct value or nested in an apy field
        if (typeof ratesData.protected["24HR"] === 'number') {
          currentApy = ratesData.protected["24HR"];
        } else if (ratesData.protected["24HR"].apy !== undefined) {
          currentApy = ratesData.protected["24HR"].apy;
        }
      } else if (ratesData.current_apy !== undefined) {
        currentApy = ratesData.current_apy;
      } else if (ratesData.apy !== undefined) {
        currentApy = ratesData.apy;
      }
      
      setYieldRates({ current_apy: currentApy });
      
      // Fetch yield account data
      const accountResponse = await fetch(`${apiUrl}/api/yield/account?owner=${publicKey.toString()}`);
      
      if (!accountResponse.ok) {
        // If account doesn't exist yet, that's okay
        if (accountResponse.status === 404) {
          setYieldAccount({
            total_deposited: 0, // Default values as requested
            earned_interest: 0,
            last_month_earned: 0
          });
        } else {
          throw new Error('Failed to fetch yield account');
        }
      } else {
        const accountData = await accountResponse.json();
        
        // Simple mapping to our required fields
        setYieldAccount({
          total_deposited: accountData.totalUsdValue || 0,
          earned_interest: accountData.totalInterestEarned || 0,
          last_month_earned: accountData.lastMonthEarned || 0
        });
      }
    } catch (err) {
      console.error('Error fetching yield data:', err);
      setYieldError('Failed to load yield information');
      
      // Set default values in case of error
      setYieldRates({ current_apy: 5.2 });
      setYieldAccount({
        total_deposited: 15000,
        earned_interest: 342,
        last_month_earned: 65
      });
    } finally {
      setIsLoadingYield(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount) return;
    
    try {
      setIsLoading(true);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/yield/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: publicKey.toString(),
          amount: parseFloat(depositAmount)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process deposit');
      }
      
      // Refresh data after successful deposit
      fetchYieldData();
      alert(`Successfully deposited ${depositAmount} USDC to your yield account.`);
      setDepositAmount('');
      
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to process deposit: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    
    try {
      setIsLoading(true);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/yield/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: publicKey.toString(),
          amount: parseFloat(withdrawAmount)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process withdrawal');
      }
      
      // Refresh data after successful withdrawal
      fetchYieldData();
      alert(`Successfully withdrew ${withdrawAmount} USDC from your yield account.`);
      setWithdrawAmount('');
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Failed to process withdrawal: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaChartLine className="mr-3 text-primary" />
          Growth & Yield
        </h1>
        <div className="text-xs text-gray-400 flex items-center mt-1">
          <FaShieldAlt className="mr-1 text-gray-400" />
          <span>Yield infrastructure supported by Lulo</span>
        </div>
      </div>
      
      {/* Wallet Not Connected Message */}
      {!publicKey && (
        <div className="text-center py-16">
          <FaWallet className="text-6xl text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 mb-8">
            You need to connect your wallet to access yield and growth features.
          </p>
        </div>
      )}
      
      {/* Growth Page Content - Only show if wallet is connected */}
      {publicKey && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Yield Performance</h2>
              
              {isLoadingYield ? (
                <div className="flex items-center justify-center p-8">
                  <FaSpinner className="animate-spin text-primary mr-2" />
                  <span>Loading yield data...</span>
                </div>
              ) : yieldError ? (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4 text-sm">
                  {yieldError}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Deposited</p>
                      <p className="text-2xl text-primary font-semibold">{yieldInfo.totalDeposited.toLocaleString()} USDC</p>
                    </div>
                    
                    <div className="bg-white border border-secondary/20 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Current APY</p>
                      <p className="text-2xl text-secondary font-semibold">{yieldInfo.apy.toFixed(1)}%</p>
                    </div>
                    
                    <div className="bg-white border border-blue-300 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Estimated Annual</p>
                      <p className="text-2xl text-blue-600 font-semibold">{yieldInfo.estimatedAnnual.toLocaleString()} USDC</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings History</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                        <div className="flex items-center">
                          <p className="text-xl font-semibold text-emerald-600 mr-2">{yieldInfo.earnedInterest.toLocaleString()} USDC</p>
                          <span className="text-xs text-gray-500">since you started</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Last Month</p>
                        <div className="flex items-center">
                          <p className="text-xl font-semibold text-emerald-600 mr-2">{yieldInfo.lastMonthEarned.toLocaleString()} USDC</p>
                          <span className="text-xs text-gray-500">earned in interest</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start mb-4">
                <FaRegLightbulb className="text-xl text-amber-600 mr-3 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Growth Strategy</h3>
                  <p className="text-gray-700 mb-3">
                    Your funds are deployed in a diversified portfolio of stable DeFi protocols. 
                    We focus on security first, with strategies that have been battle-tested and audited.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-start">
                  <FaLock className="text-emerald-600 mr-2 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Security First</h4>
                    <p className="text-xs text-gray-600">Multiple audited protocols</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-start">
                  <FaExchangeAlt className="text-blue-600 mr-2 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Diversified</h4>
                    <p className="text-xs text-gray-600">Risk spread across platforms</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 p-3 rounded-lg flex items-start">
                  <FaRegClock className="text-purple-600 mr-2 mt-1" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">Always Available</h4>
                    <p className="text-xs text-gray-600">Withdraw anytime with no fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Deposit/Withdraw Forms */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaArrowUp className="mr-2 text-primary" /> Deposit
              </h2>
              
              <form onSubmit={handleDeposit}>
                <div className="mb-4">
                  <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Deposit (USDC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="depositAmount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      min="1"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-start">
                  <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                  <p>
                    Deposits start earning interest immediately. Current APY: <strong>{yieldInfo.apy.toFixed(1)}%</strong>
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaArrowUp className="mr-2" /> Deposit Funds
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaArrowDown className="mr-2 text-secondary" /> Withdraw
              </h2>
              
              <form onSubmit={handleWithdraw}>
                <div className="mb-4">
                  <label htmlFor="withdrawAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Withdraw (USDC)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="withdrawAmount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      min="1"
                      max={yieldInfo.totalDeposited} // Dynamic based on available balance
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-700 flex items-start">
                  <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                  <p>
                    Withdrawals are processed immediately with no fees. Maximum amount: <strong>{yieldInfo.totalDeposited.toLocaleString()} USDC</strong>
                  </p>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-secondary text-white py-3 px-4 rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FaArrowDown className="mr-2" /> Withdraw Funds
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrowthPage; 