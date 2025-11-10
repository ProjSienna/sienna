import React, { useState } from 'react';
import X402PaymentWidget from './X402PaymentWidget';

/**
 * X402PaymentDemo - Example usage of the X402PaymentWidget
 * 
 * This component demonstrates how to integrate the X402PaymentWidget
 * into your application with custom callbacks and configurations.
 */
const X402PaymentDemo = () => {
  const [paymentResult, setPaymentResult] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [endpoint, setEndpoint] = useState('http://localhost:4000/api/payment');

  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    setPaymentResult({
      status: 'success',
      ...result
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentResult({
      status: 'error',
      message: error.message
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            X402 Payment Widget Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This demo shows how to use the X402PaymentWidget component to accept payments
            using the X402 protocol. The widget automatically fetches payment requirements
            from your backend and handles the entire payment flow.
          </p>

          {/* Configuration Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Endpoint
                </label>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="http://localhost:4000/api/payment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Amount (USDC) - Optional
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty for default amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Description - Optional
                </label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Leave empty for default description"
                />
              </div>
            </div>
          </div>

          {/* Payment Widget */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Widget</h2>
            <X402PaymentWidget
              endpoint={endpoint}
              amount={customAmount || null}
              description={customDescription || null}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </div>

          {/* Payment Result */}
          {paymentResult && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Result</h2>
              <div className={`rounded-lg p-4 ${
                paymentResult.status === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(paymentResult, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Usage Example */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Usage Example</h2>
            <pre className="bg-white rounded p-4 overflow-auto text-sm">
{`import X402PaymentWidget from './components/X402PaymentWidget';

function MyComponent() {
  const handleSuccess = (result) => {
    console.log('Payment successful:', result);
    // Handle successful payment
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
    // Handle payment error
  };

  return (
    <X402PaymentWidget
      endpoint="http://localhost:4000/api/payment"
      amount={0.01}
      description="Premium content access"
      onPaymentSuccess={handleSuccess}
      onPaymentError={handleError}
    />
  );
}`}
            </pre>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Documentation</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Props</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><code className="bg-gray-100 px-2 py-1 rounded">endpoint</code> (required): The API endpoint to fetch payment requirements from</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">amount</code> (optional): Custom payment amount in USDC</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">description</code> (optional): Custom payment description</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">onPaymentSuccess</code> (optional): Callback function when payment succeeds</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">onPaymentError</code> (optional): Callback function when payment fails</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Backend Requirements</h3>
              <p className="text-gray-600 mb-2">
                Your backend endpoint must return a 402 status code with an X402Response format:
              </p>
              <pre className="bg-gray-100 rounded p-4 overflow-auto text-sm">
{`{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "devnet",
    "maxAmountRequired": "10000",
    "resource": "/api/payment",
    "description": "Payment required for access",
    "mimeType": "application/json",
    "payTo": "TokenAccountAddress...",
    "maxTimeoutSeconds": 300,
    "asset": "USDC",
    "extra": {
      "recipientWallet": "WalletAddress...",
      "mint": "USDCMintAddress...",
      "cluster": "devnet",
      "amountUSDC": 0.01
    }
  }]
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Features</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Automatic payment requirement fetching</li>
                <li>Wallet integration with Solana wallet adapter</li>
                <li>Transaction creation and submission</li>
                <li>Payment verification and proof submission</li>
                <li>Beautiful UI with loading, success, and error states</li>
                <li>Transaction explorer links</li>
                <li>Fully customizable with callbacks</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default X402PaymentDemo;
