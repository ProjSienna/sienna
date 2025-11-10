import React, { useState } from 'react';
import { FaCode, FaCopy, FaCheck, FaReact, FaPython, FaTerminal, FaGlobe, FaLightbulb } from 'react-icons/fa';
import X402PaymentWidget from '../components/X402PaymentWidget';

const ApiPage = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [activeTabs, setActiveTabs] = useState({});
  const [isClientExampleExpanded, setIsClientExampleExpanded] = useState(false);

  const handleCopy = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const handleTabChange = (endpointId, tab) => {
    setActiveTabs(prev => ({
      ...prev,
      [endpointId]: tab
    }));
  };

  const endpoints = [
    {
      id: 'x402-payment',
      title: 'x402 Payment Request',
      description: 'Request payment requirements using the x402 standard with Solana USDC. Returns payment details including recipient wallet, token account, and amount.',
      endpoint: '/api/payment',
      method: 'GET',
      curl: `curl -X GET "https://api.projectsienna.xyz/api/payment?network=mainnet&amount=5"`,
      js: `// Using fetch API
const requestPayment = async () => {
  const response = await fetch('https://api.projectsienna.xyz/api/payment?network=mainnet&amount=5', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  console.log(data);
  // Returns payment requirements with status 402
}`,
      python: `# Using requests library
import requests

url = "https://api.projectsienna.xyz/api/payment"
params = {
    "network": "mainnet",
    "amount": 5
}

response = requests.get(url, params=params)
print(response.json())`
    },
    {
      id: 'payment-request-email',
      title: 'Send Payment Request Email',
      description: 'Sends a payment request email to a recipient with a payment link.',
      endpoint: '/api/email/payment-request',
      method: 'POST',
      curl: `curl -X POST https://api.projectsienna.xyz/api/email/payment-request \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "recipient@example.com",
    "name": "Recipient Name",
    "recipientWallet": "payee123456",
    "amount": "100.00",
    "relationship": "client",
    "context": "Website design project",
    "senderName": "Sender Name",
    "senderEmail": "sender@example.com",
    "dueDate": "2025-08-15"
  }'`,
      js: `// Using fetch API
const sendPaymentRequest = async () => {
  const response = await fetch('https://api.projectsienna.xyz/api/email/payment-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'recipient@example.com',
      name: 'Recipient Name',
      recipientWallet: 'payee123456',
      amount: '100.00',
      relationship: 'client',
      context: 'Website design project',
      senderName: 'Sender Name',
      senderEmail: 'sender@example.com',
      dueDate: '2025-08-15'
    }),
  });
  
  const data = await response.json();
  console.log(data);
}`,
      python: `# Using requests library
import requests
import json

url = "https://api.projectsienna.xyz/api/email/payment-request"
payload = {
    "email": "recipient@example.com",
    "name": "Recipient Name",
    "recipientWallet": "payee123456",
    "amount": "100.00",
    "relationship": "client",
    "context": "Website design project",
    "senderName": "Sender Name",
    "senderEmail": "sender@example.com",
    "dueDate": "2025-08-15"
}
headers = {"Content-Type": "application/json"}

response = requests.post(url, data=json.dumps(payload), headers=headers)
print(response.json())`
    }
  ];

  // Initialize active tabs with curl as default if not set
  endpoints.forEach(endpoint => {
    if (!activeTabs[endpoint.id]) {
      activeTabs[endpoint.id] = 'curl';
    }
  });

  // Function to get the active code example based on the active tab
  const getActiveCode = (endpoint) => {
    const activeTab = activeTabs[endpoint.id] || 'curl';
    return {
      code: endpoint[activeTab],
      activeTab,
      language: activeTab === 'curl' ? 'bash' : activeTab === 'js' ? 'javascript' : 'python'
    };
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sienna x402 Payment API</h1>
        <p className="text-xl text-gray-600 mb-6">
          Blockchain-native payment API using the x402 standard with Solana USDC.
        </p>
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start">
            <FaGlobe className="text-blue-500 text-2xl mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Base URL</h3>
              <p className="text-gray-700 mb-3">All API endpoints are available at the following base URL:</p>
              <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm mb-3 overflow-x-auto whitespace-pre-wrap break-words">
                https://api.projectsienna.xyz
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex items-center mb-6">
          <FaLightbulb className="text-yellow-500 text-2xl mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">AI-Powered Features</h2>
        </div>
        <p className="text-gray-700 mb-4">
          Our API includes powerful AI capabilities to enhance your payment experience:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-100">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Smart Email Templates</h3>
            <p className="text-gray-700">
              AI-generated email content that adapts based on the relationship between sender and recipient, payment context, and amount.
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-red-50 p-6 rounded-lg border border-pink-100">
            <h3 className="text-lg font-semibold text-pink-800 mb-2">Personalized Communication</h3>
            <p className="text-gray-700">
              Our system analyzes previous interactions to tailor communication style and follow-up frequency for better payment outcomes.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">🧪 Testing with Devnet</h3>
          <p className="text-gray-700 mb-3">
            You can test the x402 payment API using Solana devnet before deploying to production. Simply add <code className="bg-yellow-100 px-2 py-1 rounded text-sm">?network=devnet</code> to your API requests.
          </p>
          <div className="bg-white p-3 rounded border border-yellow-200 font-mono text-sm overflow-x-auto">
            https://api.projectsienna.xyz/api/payment?network=devnet&amount=0.5
          </div>
          <p className="text-gray-600 text-sm mt-3">
            Devnet uses test USDC tokens, so you can experiment without real funds. Get devnet USDC from the <a href="https://spl-token-faucet.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Solana Token Faucet</a>.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 overflow-hidden">
          <button
            onClick={() => setIsClientExampleExpanded(!isClientExampleExpanded)}
            className="w-full p-6 text-left hover:bg-blue-100 transition-colors flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">🎨 X402 Payment Widget - React Component</h3>
              <p className="text-gray-700">
                Ready-to-use React component for x402 payments. Click to see the code and try the live demo.
              </p>
            </div>
            <span className="text-2xl text-blue-900">{isClientExampleExpanded ? '−' : '+'}</span>
          </button>
          
          {isClientExampleExpanded && (
            <div className="p-6 pt-0 border-t border-blue-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side: Code example */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Usage Example</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`// For now, copy the X402PaymentWidget component from:
// https://github.com/projectsienna/sienna-code/blob/main/sienna/src/components/X402PaymentWidget.js

import X402PaymentWidget from './components/X402PaymentWidget';

function PremiumPaywall() {
  const handleSuccess = (result) => {
    console.log('Payment successful!', result);
    // Unlock premium content
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <X402PaymentWidget
      endpoint="https://api.projectsienna.xyz/api/payment"
      network="devnet"
      amount={0.01}
      description="Premium content access"
      onPaymentSuccess={handleSuccess}
      onPaymentError={handleError}
    />
  );
}

export default PremiumPaywall;`}</code>
                  </pre>
                  
                  <div className="mt-4 bg-blue-100 p-4 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">Props</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li><code className="bg-white px-2 py-0.5 rounded">endpoint</code> - Backend API URL (e.g., https://api.projectsienna.xyz/api/payment)</li>
                      <li><code className="bg-white px-2 py-0.5 rounded">network</code> - "devnet" or "mainnet"</li>
                      <li><code className="bg-white px-2 py-0.5 rounded">amount</code> - Payment amount in USDC</li>
                      <li><code className="bg-white px-2 py-0.5 rounded">description</code> - Payment description</li>
                      <li><code className="bg-white px-2 py-0.5 rounded">onPaymentSuccess</code> - Success callback</li>
                      <li><code className="bg-white px-2 py-0.5 rounded">onPaymentError</code> - Error callback</li>
                    </ul>
                  </div>
                  
                  <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-900 mb-2">📦 NPM Package Coming Soon</h5>
                    <p className="text-sm text-gray-700 mb-2">
                      We're working on publishing this as an npm package. For now, you can:
                    </p>
                    <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                      <li>Copy the component from our GitHub repository</li>
                      <li>Install required dependencies: <code className="bg-white px-2 py-0.5 rounded">@solana/wallet-adapter-react @solana/web3.js @solana/spl-token</code></li>
                      <li>Ensure your app has Solana wallet adapter context providers</li>
                    </ol>
                  </div>
                </div>

                {/* Right side: Live demo */}
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Live Demo</h4>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <X402PaymentWidget
                      endpoint="https://api.projectsienna.xyz/api/payment"
                      network="devnet"
                      amount={0.01}
                      description="API Demo Payment"
                      onPaymentSuccess={(result) => {
                        console.log('Demo payment successful:', result);
                        alert('Payment successful! Check console for details.');
                      }}
                      onPaymentError={(error) => {
                        console.error('Demo payment error:', error);
                        alert('Payment failed: ' + error.message);
                      }}
                    />
                  </div>
                  <div className="mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700">
                      <strong>💡 Note:</strong> This demo uses devnet. Make sure your wallet is connected to Solana devnet and has test USDC.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Frontend Implementation Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">💳 Paywalls & Premium Content</h3>
            <p className="text-gray-700 mb-3">
              Gate premium content behind x402 payments. When users try to access premium articles, videos, or features, request payment before unlocking content.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Example:</strong> Blog platform where readers pay 0.10 USDC per article, or subscription service with monthly USDC payments.
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🛒 E-commerce Checkout</h3>
            <p className="text-gray-700 mb-3">
              Integrate crypto payments into your checkout flow. Request payment at checkout and verify on-chain before order fulfillment.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Example:</strong> Online store accepting USDC payments with instant settlement, or marketplace with escrow-free transactions.
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎮 In-App Purchases</h3>
            <p className="text-gray-700 mb-3">
              Enable microtransactions for gaming, virtual goods, or app features. Users pay small amounts of USDC for power-ups, skins, or premium features.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Example:</strong> Game where players buy items for 0.50 USDC, or productivity app with feature unlocks.
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🤖 API Usage Metering</h3>
            <p className="text-gray-700 mb-3">
              Charge for API usage on a per-request basis. Each API call requires a small USDC payment, enabling pay-as-you-go pricing models.
            </p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <strong>Example:</strong> AI API charging 0.01 USDC per request, or data API with usage-based pricing.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} id={endpoint.id} className="scroll-mt-24">
            <div className="flex items-center mb-4">
              <FaCode className="text-primary text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">{endpoint.title}</h2>
            </div>
            <p className="text-gray-600 mb-6">{endpoint.description}</p>
            
            <div className="mb-6">
              <div className="flex flex-wrap items-center mb-2">
                <span className={`inline-block px-3 py-1 text-sm rounded-md font-medium ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {endpoint.method}
                </span>
                <span className="ml-3 font-mono text-gray-700 overflow-x-auto max-w-full">{endpoint.endpoint}</span>
                <button
                  onClick={() => handleCopy(endpoint.endpoint, endpoint.id + '-endpoint')}
                  className="ml-2 p-1 text-gray-500 hover:text-primary transition-colors"
                  title="Copy endpoint"
                >
                  {copiedEndpoint === endpoint.id + '-endpoint' ? <FaCheck className="text-green-500" /> : <FaCopy />}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-8">
              <div className="flex flex-wrap border-b border-gray-200">
                <button 
                  onClick={() => handleTabChange(endpoint.id, 'curl')}
                  className={`px-4 py-2 font-medium flex items-center transition-colors ${
                    (activeTabs[endpoint.id] || 'curl') === 'curl' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaTerminal className="mr-2" /> cURL
                </button>
                <button 
                  onClick={() => handleTabChange(endpoint.id, 'js')}
                  className={`px-4 py-2 font-medium flex items-center transition-colors ${
                    activeTabs[endpoint.id] === 'js' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaReact className="mr-2" /> JavaScript
                </button>
                <button 
                  onClick={() => handleTabChange(endpoint.id, 'python')}
                  className={`px-4 py-2 font-medium flex items-center transition-colors ${
                    activeTabs[endpoint.id] === 'python' 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FaPython className="mr-2" /> Python
                </button>
              </div>
              
              <div className="relative">
                <pre className="p-4 sm:p-6 overflow-x-auto text-sm whitespace-pre-wrap break-all sm:break-normal">
                  <code className={`language-${getActiveCode(endpoint).language} mobile-friendly-code`}>{getActiveCode(endpoint).code}</code>
                </pre>
                <button
                  onClick={() => handleCopy(getActiveCode(endpoint).code, endpoint.id + '-' + getActiveCode(endpoint).activeTab)}
                  className="absolute top-4 right-4 p-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300 transition-colors"
                  title="Copy code"
                >
                  {copiedEndpoint === endpoint.id + '-' + getActiveCode(endpoint).activeTab ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Response</h3>
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap break-all sm:break-normal">
                <code className="language-json mobile-friendly-code">{endpoint.id === 'x402-payment' ? `{
  "payment": {
    "recipientWallet": "HoMwfN4toaaMtPL7Z7mar2H2CFro8n4B2HkjuFUy6qLM",
    "tokenAccount": "3Dd5Z9PNrzZySpCUe2LaLY3K66hdvks9oLt2sesbXhCx",
    "mint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 5000000,
    "amountUSDC": 5,
    "cluster": "mainnet",
    "message": "Send USDC to the token account"
  }
}` : `{
  "message": "Payment request email sent successfully",
  "aiContent": {
    "subject": "Friendly Reminder: Payment for Your Website Design Project 💻✨",
    "message": "Hi there! Just a quick and friendly reminder to settle the $100.00 USDC for your website design project. Looking forward to seeing your amazing site come to life! 😊🚀",
  },
  "data": {
    "id": "bf225204-ea42-4fe2-b7db-4c7a5385da36",
    "sentAt": "2025-08-10T14:25:16.253Z",
    "paymentLink": "https://projectsienna.xyz/pay-request?id=bf225204-ea42-4fe2-b7db-4c7a5385da36"
  }
}`}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiPage; 