import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Link } from 'react-router-dom';
import { 
  FaBolt,
  FaHistory,
  FaClock,
  FaWallet, 
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaUserPlus,
  FaFileInvoice,
  FaSatelliteDish,
  FaChartLine,
  FaSpinner,
  FaCalendarCheck
} from 'react-icons/fa';

const ActionsPage = () => {
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [recentActions, setRecentActions] = useState([]);
  const [scheduledActions, setScheduledActions] = useState([]);

  // Fetch actions when wallet is connected
  useEffect(() => {
    if (publicKey) {
      fetchActions();
    } else {
      setIsLoading(false);
    }
  }, [publicKey]);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with an actual API call in production
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      // Example recent actions data
      setRecentActions([
        { 
          id: '1', 
          type: 'deposit', 
          amount: '1,000 USDC', 
          date: '2 days ago',
          status: 'completed',
          icon: <FaArrowUp className="text-green-500" />
        },
        { 
          id: '2', 
          type: 'withdraw', 
          amount: '500 USDC', 
          date: '5 days ago',
          status: 'completed',
          icon: <FaArrowDown className="text-red-500" />
        },
        { 
          id: '3', 
          type: 'payment', 
          amount: '250 USDC', 
          date: '1 week ago',
          recipient: 'John Doe',
          status: 'completed',
          icon: <FaMoneyBillWave className="text-blue-500" />
        }
      ]);
      
      // Example scheduled actions
      setScheduledActions([
        {
          id: '1',
          type: 'payroll',
          amount: '2,500 USDC',
          date: 'Tomorrow, 9:00 AM',
          recipients: '5 employees',
          status: 'pending',
          icon: <FaMoneyBillWave className="text-purple-500" />
        },
        {
          id: '2',
          type: 'yield-deposit',
          amount: '1,000 USDC',
          date: 'Next Monday, 12:00 PM',
          status: 'pending',
          icon: <FaChartLine className="text-primary" />
        }
      ]);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Common actions definitions
  const commonActions = [
    {
      id: 'send',
      title: 'Send Payment',
      description: 'Transfer USDC to contacts or wallets',
      icon: <FaArrowRight className="text-blue-500" />,
      link: '/payroll'
    },
    {
      id: 'deposit',
      title: 'Deposit to Yield',
      description: 'Earn interest on your USDC',
      icon: <FaArrowUp className="text-green-500" />,
      link: '/growth'
    },
    {
      id: 'withdraw',
      title: 'Withdraw from Yield',
      description: 'Move funds from yield account',
      icon: <FaArrowDown className="text-red-500" />,
      link: '/growth'
    },
    {
      id: 'payment',
      title: 'Process Payments',
      description: 'Pay multiple recipients at once',
      icon: <FaMoneyBillWave className="text-purple-500" />,
      link: '/payroll/run'
    },
    {
      id: 'request',
      title: 'Request Payment',
      description: 'Create a payment request link',
      icon: <FaFileInvoice className="text-teal-500" />,
      link: '/'
    },
    {
      id: 'contact',
      title: 'Add Contact',
      description: 'Create a new payee entry',
      icon: <FaUserPlus className="text-amber-500" />,
      link: '/payroll'
    },
    {
      id: 'payment-gateway',
      title: 'Payment Gateway',
      description: 'Set up your payment gateway',
      icon: <FaSatelliteDish className="text-indigo-500" />,
      link: '/payment-gateway'
    },
    {
      id: 'swap',
      title: 'Swap Assets',
      description: 'Exchange between cryptocurrencies',
      icon: <FaExchangeAlt className="text-violet-500" />,
      link: '/'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <FaBolt className="mr-3 text-primary" />
        Actions
      </h1>
      
      {/* Wallet Not Connected Message */}
      {!publicKey && (
        <div className="text-center py-16">
          <FaWallet className="text-6xl text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 mb-8">
            You need to connect your wallet to access actions and transaction features.
          </p>
        </div>
      )}
      
      {/* Actions Content - Only show if wallet is connected */}
      {publicKey && (
        <div className="space-y-8">
          {/* Common Actions Grid */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaBolt className="mr-2 text-primary" /> Common Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {commonActions.map(action => (
                <Link 
                  key={action.id}
                  to={action.link}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-start space-x-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{action.title}</h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Recent Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaHistory className="mr-2 text-primary" /> Recent Actions
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <FaSpinner className="animate-spin text-primary mr-2" />
                <span>Loading recent actions...</span>
              </div>
            ) : recentActions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No recent actions to display.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentActions.map(action => (
                      <tr key={action.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-2">
                              {action.icon}
                            </div>
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {action.type}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{action.amount}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {action.recipient && `To: ${action.recipient}`}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{action.date}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {action.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-4 text-right">
              <Link to="/" className="text-primary hover:text-primary-dark text-sm font-medium">
                View all actions →
              </Link>
            </div>
          </div>
          
          {/* Scheduled Actions */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaClock className="mr-2 text-primary" /> Scheduled Actions
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <FaSpinner className="animate-spin text-primary mr-2" />
                <span>Loading scheduled actions...</span>
              </div>
            ) : scheduledActions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No scheduled actions to display.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledActions.map(action => (
                  <div key={action.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {action.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 capitalize">{action.type}</h3>
                          <p className="text-sm text-gray-500">{action.amount}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {action.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <FaCalendarCheck className="mr-1 text-primary" />
                      <span>{action.date}</span>
                      {action.recipients && (
                        <span className="ml-3">• {action.recipients}</span>
                      )}
                    </div>
                    
                    <div className="mt-3 flex justify-end space-x-2">
                      <button className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-red-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 text-right">
              <Link to="/" className="text-primary hover:text-primary-dark text-sm font-medium">
                View all scheduled actions →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsPage; 