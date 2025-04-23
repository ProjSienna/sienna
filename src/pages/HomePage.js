import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePayees } from '../contexts/PayeesContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { formatWalletAddress } from '../utils/solana';
import PayeeCard from '../components/PayeeCard';
import PaymentForm from '../components/PaymentForm';
import TransactionCard from '../components/TransactionCard';
import { FaPlus, FaMoneyBillWave, FaHistory, FaUsers, FaWallet } from 'react-icons/fa';

const HomePage = () => {
  const { publicKey } = useWallet();
  const { payees } = usePayees();
  const { transactions } = useTransactions();
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Show recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Show top payees
  const topPayees = payees.slice(0, 3);

  const handlePayButtonClick = (payee) => {
    setSelectedPayee(payee);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPayee(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wallet Not Connected Section */}
      {!publicKey && (
        <div className="text-center py-16">
          <FaWallet className="text-6xl text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 mb-8">
            Connect your Solana wallet to start sending USDC payments to your friends and employees.
          </p>
          <div className="mt-6 text-center">
            <p className="text-gray-500">Click the "Connect Wallet" button in the top-right corner to get started.</p>
          </div>
        </div>
      )}

      {/* Dashboard Section */}
      {publicKey && (
        <>
          {/* Payment Form Overlay */}
          {showPaymentForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="max-w-md w-full">
                <PaymentForm 
                  payee={selectedPayee} 
                  onSuccess={handlePaymentSuccess} 
                  onCancel={() => setShowPaymentForm(false)} 
                />
              </div>
            </div>
          )}

          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Sienna Pay</h1>
            <p className="text-gray-600 mt-2">
              Connected Wallet: <span className="font-mono font-medium">{formatWalletAddress(publicKey.toString())}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Payees */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaUsers className="mr-2 text-primary" /> Your Payees
                  </h2>
                  <Link 
                    to="/payees" 
                    className="text-primary font-medium text-sm hover:underline flex items-center"
                  >
                    View All
                  </Link>
                </div>

                {payees.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">You haven't added any payees yet.</p>
                    <Link 
                      to="/payees" 
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center"
                    >
                      <FaPlus className="mr-2" /> Add Your First Payee
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topPayees.map(payee => (
                      <PayeeCard
                        key={payee.id}
                        payee={payee}
                        onPay={handlePayButtonClick}
                      />
                    ))}
                    <Link 
                      to="/payees" 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors"
                    >
                      <FaPlus className="text-3xl mb-2" />
                      <span>Add New Payee</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FaHistory className="mr-2 text-primary" /> Recent Transactions
                  </h2>
                  <Link 
                    to="/history" 
                    className="text-primary font-medium text-sm hover:underline flex items-center"
                  >
                    View All
                  </Link>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No transactions yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map(transaction => (
                      <TransactionCard key={transaction.id} transaction={transaction} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-primary" /> Quick Actions
                </h2>
                
                <div className="space-y-3">
                  <Link
                    to="/payroll"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-primary bg-opacity-10 p-2 rounded-md">
                      <FaMoneyBillWave className="text-primary" />
                    </div>
                    <div className="ml-3">
                      <span className="block font-medium">Run Payroll</span>
                      <span className="text-xs text-gray-500">Pay multiple people at once</span>
                    </div>
                  </Link>
                  
                  <Link
                    to="/payees"
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-secondary bg-opacity-10 p-2 rounded-md">
                      <FaUsers className="text-secondary" />
                    </div>
                    <div className="ml-3">
                      <span className="block font-medium">Manage Payees</span>
                      <span className="text-xs text-gray-500">Add, edit or remove payees</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage; 