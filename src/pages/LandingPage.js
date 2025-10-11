import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaWallet, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaArrowUp, 
  FaUsers,
  FaFileInvoiceDollar,
  FaPeopleArrows,
  FaRegClock,
  FaShieldAlt,
  FaPaperPlane,
  FaBell,
  FaCheckCircle,
} from 'react-icons/fa';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

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
      title: "Payments Management",
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
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-16 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
        The Stablecoin Payment Stack for Modern Teams
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered tools for invoicing and tax reporting—helping creators and freelancers get paid faster, smarter, and globally with stablecoins, <span className="font-medium text-primary">so you can focus on your craft.</span>
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
              <FaCheckCircle className="mr-2" /> Thanks for subscribing! We&apos;ll be in touch soon.
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
          <span>Click &quot;Connect Wallet&quot; in the top-right corner to begin</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 