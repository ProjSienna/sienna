import React from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTransactions } from '../contexts/TransactionsContext';
import { formatWalletAddress } from '../utils/solana';
import TransactionCard from '../components/TransactionCard';
import WalletDetails from '../components/WalletDetails';
import { FaWallet, FaHistory, FaMoneyBillWave, FaChartLine, FaArrowDown, FaArrowUp, FaUsers } from 'react-icons/fa';

const HomePage = () => {
  const { publicKey } = useWallet();
  const { transactions } = useTransactions();

  // Show recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Example income data - replace with actual API data
  const incomeStats = {
    totalReceived: '25,000 USDC',
    pendingPayments: '2,500 USDC',
    lastMonthIncome: '12,000 USDC',
    monthlyGrowth: '+15%'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wallet Not Connected Section */}
      {!publicKey && (
        <div className="text-center py-16">
          <FaWallet className="text-6xl text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect your Solana wallet to start earning yield on your USDC.
          </p>
          <div className="mt-6 text-center">
            <p className="text-gray-500">Click the "Connect Wallet" button in the top-right corner to get started.</p>
          </div>
        </div>
      )}

      {/* Dashboard Section */}
      {publicKey && (
        <>
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Wallet Details */}
            <div className="lg:col-span-2">
              <WalletDetails />
            </div>

            {/* Right Column - Quick Actions */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-primary" /> Quick Actions
                </h2>
                <div className="space-y-3">
                  {/* Original Payroll Actions */}
                  <Link
                    to="/payroll/run"
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-primary bg-opacity-10 p-2 rounded-md">
                      <FaMoneyBillWave className="text-primary" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="block font-medium">Process Payroll</span>
                      <span className="text-xs text-gray-500">Pay multiple people at once</span>
                    </div>
                  </Link>

                  <Link
                    to="/payroll"
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-secondary bg-opacity-10 p-2 rounded-md">
                      <FaUsers className="text-secondary" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="block font-medium">Payroll Management</span>
                      <span className="text-xs text-gray-500">Manage payees and transactions</span>
                    </div>
                  </Link>

                  {/* Divider */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-sm text-gray-500">Payment Gateway</span>
                    </div>
                  </div>

                  {/* Payment Gateway Actions */}
                  <button
                    onClick={() => {/* Handle payment gateway setup */}}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-primary bg-opacity-10 p-2 rounded-md">
                      <FaMoneyBillWave className="text-primary" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="block font-medium">Setup Payment Gateway</span>
                      <span className="text-xs text-gray-500">Accept payments from customers</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {/* Handle payment link creation */}}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-secondary bg-opacity-10 p-2 rounded-md">
                      <FaArrowDown className="text-secondary" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="block font-medium">Create Payment Link</span>
                      <span className="text-xs text-gray-500">Generate shareable payment URLs</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {/* Handle payment request */}}
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-green-500 bg-opacity-10 p-2 rounded-md">
                      <FaArrowUp className="text-green-500" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="block font-medium">Request Payment</span>
                      <span className="text-xs text-gray-500">Send payment requests</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Income Tracking Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaChartLine className="mr-2 text-primary" /> Income Dashboard
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Total Received</p>
                <p className="text-2xl text-primary">{incomeStats.totalReceived}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Pending Payments</p>
                <p className="text-2xl text-orange-500">{incomeStats.pendingPayments}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Last Month</p>
                <p className="text-2xl text-gray-800">{incomeStats.lastMonthIncome}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Monthly Growth</p>
                <p className="text-2xl text-green-500">{incomeStats.monthlyGrowth}</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaHistory className="mr-2 text-primary" /> Recent Transactions
              </h2>
              <Link 
                to="/history" 
                className="text-primary hover:text-primary-dark text-sm font-medium hover:underline"
              >
                View All Transactions
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No transactions yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Start receiving payments or earning yield to see your transaction history.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage; 