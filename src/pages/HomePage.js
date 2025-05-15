import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTransactions } from '../contexts/TransactionsContext';
import { formatWalletAddress } from '../utils/solana';
import TransactionCard from '../components/TransactionCard';
import WalletDetails from '../components/WalletDetails';
import RequestPaymentForm from '../components/RequestPaymentForm';
import PaymentGatewayGuide from '../components/PaymentGatewayGuide';
import { 
  FaWallet, 
  FaHistory, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaArrowDown, 
  FaArrowUp, 
  FaUsers,
  FaFileInvoiceDollar,
  FaPeopleArrows,
  FaRegClock,
  FaShieldAlt,
  FaSatelliteDish,
  FaPaperPlane,
  FaBell,
  FaCheckCircle,
  FaSync
} from 'react-icons/fa';

const HomePage = () => {
  const { publicKey } = useWallet();
  const { transactions } = useTransactions();
  const [showRequestPayment, setShowRequestPayment] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If user is not authenticated, redirect to landing page
  if (!publicKey) {
    return <Navigate to="/landing" />;
  }

  // Show recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Example income data - replace with actual API data
  const incomeStats = {
    totalReceived: '25,000 USDC',
    pendingPayments: '2,500 USDC',
    lastMonthIncome: '12,000 USDC',
    monthlyGrowth: '+15%'
  };

  const handleRequestPayment = () => {
    setShowRequestPayment(true);
  };

  const handlePaymentGatewaySetup = () => {
    setShowPaymentGateway(true);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      setSubscribing(true);
      
      // Call the API to add the email to the contact list
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/email/add-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          updateEnabled: false
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to subscribe');
      }
      
      setSubscribed(true);
      // Reset after 5 seconds
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 5000);
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Could not subscribe at this time. Please try again later.');
    } finally {
      setSubscribing(false);
    }
  };

  const handleRefreshBalances = async () => {
    setIsLoading(true);
    try {
      // Call the API to refresh balances
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/balances/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh balances');
      }
      
      // Refresh the transactions
      // This is a placeholder and should be replaced with actual API call to refresh transactions
      // For now, we'll just reload the page
      window.location.reload();
    } catch (error) {
      console.error('Balance refresh error:', error);
      alert('Failed to refresh balances. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [

    {
      icon: <FaArrowUp className="text-3xl text-primary" />,
      title: "Request Payments",
      description: "Create and share payment requests with customizable messages"
    },
    {
      icon: <FaFileInvoiceDollar className="text-3xl text-primary" />,
      title: "Send Invoices",
      description: "Generate professional invoices and get paid in USDC"
    },
    {
      icon: <FaUsers className="text-3xl text-primary" />,
      title: "Payroll Management",
      description: "Streamline your payroll process with automated USDC payments"
    },
    {
      icon: <FaChartLine className="text-3xl text-primary" />,
      title: "Grow Your Wealth",
      description: "Smart tools designed to maximize returns and help your money work for you"
    },
    {
      icon: <FaMoneyBillWave className="text-3xl text-primary" />,
      title: "Easy Tax Reporting",
      description: "Streamline your tax compliance with detailed payment records"
    },
    {
      icon: <FaPeopleArrows className="text-3xl text-primary" />,
      title: "Bulk Transfers",
      description: "Process multiple payments in one go with our efficient bulk transfer system"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Request Payment Modal */}
      {showRequestPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <RequestPaymentForm onClose={() => setShowRequestPayment(false)} />
        </div>
      )}

      {/* Payment Gateway Guide Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentGatewayGuide onClose={() => setShowPaymentGateway(false)} />
        </div>
      )}

      {/* Landing Section for Non-Connected Users */}
      {!publicKey && (
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center py-16 max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
            The Stablecoin Payment Stack for Modern Teams
            </h1>
            <p className="text-xl text-gray-600 mb-8">
            <span className="font-medium text-primary">
              AI-powered tools, invoicing, and tax reporting—so you can focus on your craft.
            </span>
            <br />
            Helping creators and freelancers get paid faster, smarter, and globally with stablecoins.
            <br />
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-primary">
                <FaShieldAlt />
                <span>Non Custodial</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2 text-primary">
                <FaRegClock />
                <span>Instant</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2 text-primary">
                <FaMoneyBillWave />
                <span>Low Fees</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Affordable, flexible crypto payments for small businesses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* API Documentation Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Plug-and-Play Payment API for Small Business Owners
            </h2>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-md">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left column - Code Example */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Simple Integration</h3>
                  <p className="text-gray-600 mb-6">
                    Our API makes it easy to add payment functionality to your applications. 
                    Send payment requests, manage contacts, and track transactions.
                  </p>
                  <div className="bg-slate-800 text-gray-100 rounded-lg p-4 mb-4 overflow-x-auto relative text-sm">
                    <pre className="whitespace-pre-wrap break-all sm:break-normal"><code className="mobile-friendly-code">{`// Send a payment request email with AI-enhanced content
fetch('https://api.projectsienna.xyz/api/email/payment-request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'recipient@example.com',
    name: 'Recipient Name',
    amount: '100.00',
    relationship: 'client',
    context: 'Website design project',
    senderName: 'Your Name'
  }),
})`}</code></pre>
                  </div>
                  <div className="flex justify-end">
                    <Link 
                      to="/api" 
                      className="flex items-center text-primary hover:text-secondary font-medium"
                    >
                      View full API documentation
                      <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                {/* Right column - AI Features */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    <span className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-sm font-medium mr-2">AI-Enhanced</span>
                    Smart Communication
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Our API leverages artificial intelligence to optimize payment communications
                    and maximize your payment success rates.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-800">Personalized Email Templates</h4>
                        <p className="text-xs text-gray-500">AI adapts email content based on relationship and context</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-800">Smart Follow-ups</h4>
                        <p className="text-xs text-gray-500">Optimal timing for payment reminders based on behavior patterns</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-800">Language Optimization</h4>
                        <p className="text-xs text-gray-500">Content adjusted based on cultural context and relationship</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl py-12 px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-primary/20 p-3 rounded-full">
                  <FaBell className="text-2xl text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Stay Updated
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Subscribe to our newsletter for the latest Sienna updates, feature releases, and payment tips
              </p>
              
              {subscribed ? (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg max-w-md mx-auto flex items-center justify-center">
                  <FaCheckCircle className="mr-2" /> Thanks for subscribing! We'll be in touch soon.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
                    disabled={subscribing}
                  >
                    {subscribing ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        <span>Subscribing...</span>
                      </div>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" /> Subscribe
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to start sending and receiving payments in stablecoins.
            </p>
            <div className="flex justify-center items-center gap-2 text-gray-500">
              <FaWallet className="text-xl" />
              <span>Click "Connect Wallet" in the top-right corner to begin</span>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Section */}
      {publicKey && (
        <>
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Quick Actions */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-primary" /> Quick Actions
                </h2>
                <div className="space-y-3">
                  {/* Request Payment */}
                  <button
                    onClick={handleRequestPayment}
                    className="w-full flex items-center p-3 border border-orange-500 rounded-lg hover:bg-orange-100 text-orange-500"
                  >
                    <div className="bg-orange-500 bg-opacity-10 p-2 rounded-md">
                      <FaArrowUp className="text-orange-500" />
                    </div>
                    <div className="ml-3 text-left">
                      <span className="block font-medium">Request Payment</span>
                      <span className="text-xs text-gray-500">Send payment requests</span>
                    </div>
                  </button>

                  {/* Create Payment Gateway */}
                  <Link 
                    to="/payment-gateway"
                    className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="bg-primary bg-opacity-10 p-2 rounded-md">
                      <FaMoneyBillWave className="text-primary" />
                    </div>
                    <div className="ml-3 text-left flex-grow">
                      <span className="block font-medium">Setup Payment Gateway</span>
                      <span className="text-xs text-gray-500">Accept payments from customers</span>
                    </div>
                  </Link>

                  {/* Create Payment Link */}
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

                  {/* Payroll Divider */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 text-sm text-gray-500">Payroll Management</span>
                    </div>
                  </div>

                  {/* Payroll Management */}
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

                  {/* Process Payroll */}
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
                </div>
              </div>
            </div>

            {/* Right Column - Wallet Details */}
            <div className="lg:col-span-2">
              <WalletDetails />
            </div>
          </div>

          {/* Financial Dashboard Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaChartLine className="mr-2 text-primary" /> Financial Dashboard
              </h2>
              <button 
                onClick={handleRefreshBalances}
                className="text-sm text-primary flex items-center"
                disabled={isLoading}
              >
                <FaSync className={isLoading ? "animate-spin mr-1" : "mr-1"} />
                Refresh
              </button>
            </div>

            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Total Received</p>
                <p className="text-2xl text-primary">{incomeStats.totalReceived}</p>
                <div className="flex items-center mt-2 text-xs text-green-600">
                  <FaArrowUp className="mr-1" /> 
                  <span>+12% from last month</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Pending Income</p>
                <p className="text-2xl text-orange-500">{incomeStats.pendingPayments}</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>Expected within 7 days</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                <p className="text-2xl text-red-500">8,500 USDC</p>
                <div className="flex items-center mt-2 text-xs text-red-500">
                  <FaArrowUp className="mr-1" /> 
                  <span>+5% from last month</span>
                </div>
              </div>
              <Link to="/growth" className="block">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 h-full cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500 mb-1">Yield Earnings</p>
                    <span className="text-xs text-green-600 font-medium">View Details →</span>
                  </div>
                  <p className="text-2xl text-green-600">1,250 USDC</p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>Current APY: 5.2%</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Financial Health and Insights */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">AI-Powered Financial Insights</h3>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5">
                <div className="prose max-w-none text-gray-700">
                  <p className="text-sm">
                    <span className="font-semibold">Cash Flow Analysis:</span> Based on your transaction history, your monthly income is approximately 12,000 USDC, while your expenses average around 8,500 USDC. This gives you a positive cash flow of ~3,500 USDC per month.
                  </p>
                  <p className="text-sm mt-3">
                    <span className="font-semibold">Financial Health Score:</span> <span className="text-green-600 font-medium">85/100</span> - Your financial health is strong with a good balance of income, savings, and yield generation. Consider increasing your yield deposits to maximize passive income.
                  </p>
                  <p className="text-sm mt-3">
                    <span className="font-semibold">Opportunity:</span> Depositing an additional 10,000 USDC into yield could generate approximately 520 USDC annually at current rates.
                  </p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Positive Cash Flow
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Regular Income Pattern
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Yield Opportunity
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Income Breakdown */}
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <FaArrowDown className="mr-2 text-green-500" /> Income Breakdown
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Client Payments</div>
                      <div className="text-sm font-medium">15,000 USDC</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Recurring Income</div>
                      <div className="text-sm font-medium">8,500 USDC</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Yield Earnings</div>
                      <div className="text-sm font-medium">1,500 USDC</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '6%' }}></div>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700">Total</div>
                      <div className="text-sm font-bold text-gray-800">25,000 USDC</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expense Breakdown */}
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                  <FaArrowUp className="mr-2 text-red-500" /> Expense Breakdown
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Business Services</div>
                      <div className="text-sm font-medium">3,500 USDC</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '41%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Payroll</div>
                      <div className="text-sm font-medium">4,200 USDC</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '49%' }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">Software & Tools</div>
                      <div className="text-sm font-medium">800 USDC</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                    </div>
                    
                    <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                      <div className="text-sm font-medium text-gray-700">Total</div>
                      <div className="text-sm font-bold text-gray-800">8,500 USDC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial Forecast */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                3-Month Forecast
              </h3>
              
              <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      Income
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                      Expenses
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                      Net
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    AI-powered prediction
                  </div>
                </div>
                
                <div className="relative h-48">
                  {/* This would be replaced with a real chart component */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Forecast Summary:</p>
                      <p className="text-xl font-bold text-gray-800 mt-1">+10,500 USDC</p>
                      <p className="text-xs text-gray-500 mt-1">Projected 3-month surplus</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500">June</p>
                      <p className="text-sm font-medium text-green-600">+3,200 USDC</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">July</p>
                      <p className="text-sm font-medium text-green-600">+3,500 USDC</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">August</p>
                      <p className="text-sm font-medium text-green-600">+3,800 USDC</p>
                    </div>
                  </div>
                </div>
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