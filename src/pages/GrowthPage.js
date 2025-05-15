import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown, 
  FaInfoCircle,
  FaLock,
  FaRegLightbulb,
  FaExchangeAlt,
  FaRegClock
} from 'react-icons/fa';

const GrowthPage = () => {
  const { publicKey } = useWallet();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If user is not authenticated, redirect to landing page
  if (!publicKey) {
    return <Navigate to="/landing" />;
  }

  // Example growth data - would be replaced with actual data from your API
  const growthData = {
    totalDeposited: '15,000 USDC',
    currentYield: '5.2%',
    estimatedAnnualReturn: '780 USDC',
    totalEarned: '342 USDC',
    lastMonthEarned: '65 USDC'
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount) return;
    
    try {
      setIsLoading(true);
      // This would be replaced with your actual deposit logic
      console.log(`Depositing ${depositAmount} USDC`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Successfully deposited ${depositAmount} USDC to your yield account.`);
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to process deposit. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount) return;
    
    try {
      setIsLoading(true);
      // This would be replaced with your actual withdrawal logic
      console.log(`Withdrawing ${withdrawAmount} USDC`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Successfully withdrew ${withdrawAmount} USDC from your yield account.`);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Failed to process withdrawal. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <FaChartLine className="mr-3 text-primary" />
        Growth & Yield
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Stats */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Yield Performance</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Total Deposited</p>
                <p className="text-2xl text-primary">{growthData.totalDeposited}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Current APY</p>
                <p className="text-2xl text-green-600">{growthData.currentYield}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Estimated Annual</p>
                <p className="text-2xl text-blue-600">{growthData.estimatedAnnualReturn}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings History</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Earned</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-green-600 mr-2">{growthData.totalEarned}</p>
                    <span className="text-xs text-gray-500">since you started</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Month</p>
                  <div className="flex items-center">
                    <p className="text-xl font-semibold text-green-600 mr-2">{growthData.lastMonthEarned}</p>
                    <span className="text-xs text-gray-500">earned in interest</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-sm">
            <div className="flex items-start mb-4">
              <FaRegLightbulb className="text-xl text-indigo-500 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-indigo-800 mb-2">Growth Strategy</h3>
                <p className="text-gray-700 mb-3">
                  Your funds are deployed in a diversified portfolio of stable DeFi protocols. 
                  We focus on security first, with strategies that have been battle-tested and audited.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white bg-opacity-70 p-3 rounded-lg flex items-start">
                <FaLock className="text-green-500 mr-2 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Security First</h4>
                  <p className="text-xs text-gray-600">Multiple audited protocols</p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-70 p-3 rounded-lg flex items-start">
                <FaExchangeAlt className="text-blue-500 mr-2 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-gray-800">Diversified</h4>
                  <p className="text-xs text-gray-600">Risk spread across platforms</p>
                </div>
              </div>
              
              <div className="bg-white bg-opacity-70 p-3 rounded-lg flex items-start">
                <FaRegClock className="text-purple-500 mr-2 mt-1" />
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
              <FaArrowUp className="mr-2 text-green-500" /> Deposit
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
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex items-start">
                <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                <p>
                  Deposits start earning interest immediately. Current APY: <strong>{growthData.currentYield}</strong>
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
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
              <FaArrowDown className="mr-2 text-orange-500" /> Withdraw
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
                    max="15000" // This should be dynamic based on available balance
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800 flex items-start">
                <FaInfoCircle className="mr-2 mt-1 flex-shrink-0" />
                <p>
                  Withdrawals are processed immediately with no fees. Maximum amount: <strong>{growthData.totalDeposited}</strong>
                </p>
              </div>
              
              <button
                type="submit"
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
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
    </div>
  );
};

export default GrowthPage; 