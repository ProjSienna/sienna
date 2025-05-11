import React from 'react';
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa';

const PaymentGatewayGuide = ({ onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Payment Gateway Setup</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>
      
      <div className="p-6">
        <div className="prose max-w-none">
          <h1>Sienna Payment System - Client Guide</h1>
          
          <p className="lead">
            This guide explains the simple process to create transactions and generate payment links for your clients using the Sienna Payment System.
          </p>
                    
          <h3>One Simple Step: Create and Share</h3>
          
          <p>Create a transaction and get a payment link in one simple step:</p>
          
          <div className="bg-gray-50 p-4 rounded-lg relative">
            <pre className="text-sm overflow-x-auto font-mono">
              {`curl -X POST https://api.projectsienna.xyz/api/transactions \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": "100.00",
    "recipient_wallet": "Your Wallet Address",
    "recipient_name": "Your Name",
    "memo": "Item ID - {your item id}",
    "status": "requested"
  }'`}
            </pre>
            <button 
              onClick={() => handleCopy(`curl -X POST https://api.projectsienna.xyz/api/transactions \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": "100.00",
    "recipient_wallet": "Your Wallet Address",
    "recipient_name": "Your Name",
    "memo": "Item ID - {your item id}",
    "status": "requested"
  }'`)}
              className="absolute top-2 right-2 text-gray-500 hover:text-primary p-1"
            >
              {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
            </button>
          </div>
          
          <p>You'll receive a response with a transaction ID:</p>
          
          <div className="bg-gray-50 p-4 rounded-lg relative">
            <pre className="text-sm overflow-x-auto font-mono">
              {`{
  "id": "28ecec7a-5438-4d09-9af3-0282adc0ffce",
  "amount": "100",
  "recipient_wallet": "Your Wallet Address",
  "recipient_name": "Your Name",
  "memo": "Item ID - {your item id}",
  "status": "requested",
  "timestamp": "2025-05-11T03:40:00.167Z"
}`}
            </pre>
            <button 
              onClick={() => handleCopy(`{
  "id": "28ecec7a-5438-4d09-9af3-0282adc0ffce",
  "amount": "100",
  "recipient_wallet": "Your Wallet Address",
  "recipient_name": "Your Name",
  "memo": "Item ID - {your item id}",
  "status": "requested",
  "timestamp": "2025-05-11T03:40:00.167Z"
}`)}
              className="absolute top-2 right-2 text-gray-500 hover:text-primary p-1"
            >
              {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
            </button>
          </div>
          
          <p>Simply take the transaction ID and create a payment link with this format:</p>
          
          <div className="bg-gray-50 p-4 rounded-lg relative">
            <pre className="text-sm overflow-x-auto font-mono">
              {`https://projectsienna.xyz/pay-request?id=28ecec7a-5438-4d09-9af3-0282adc0ffce`}
            </pre>
            <button 
              onClick={() => handleCopy(`https://projectsienna.xyz/pay-request?id=28ecec7a-5438-4d09-9af3-0282adc0ffce`)}
              className="absolute top-2 right-2 text-gray-500 hover:text-primary p-1"
            >
              {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
            </button>
          </div>
          
          <p>Share this link with your client, and they'll be able to complete the payment through the payment page.</p>
          
          <h2>Tracking Transactions: Check Transaction Status</h2>
          
          <div className="bg-gray-50 p-4 rounded-lg relative">
            <pre className="text-sm overflow-x-auto font-mono">
              {`curl -X GET https://api.projectsienna.xyz/api/transactions/28ecec7a-5438-4d09-9af3-0282adc0ffce`}
            </pre>
            <button 
              onClick={() => handleCopy(`curl -X GET https://api.projectsienna.xyz/api/transactions/28ecec7a-5438-4d09-9af3-0282adc0ffce`)}
              className="absolute top-2 right-2 text-gray-500 hover:text-primary p-1"
            >
              {copied ? <FaCheck className="text-green-500" /> : <FaCopy />}
            </button>
          </div>
          
          <h2>Best Practices</h2>
          
          <ol>
            <li><strong>Always verify wallet addresses</strong> - Double-check that the recipient_wallet and sender_wallet values are correct.</li>
            <li><strong>Include descriptive memos</strong> - This helps both you and your clients understand what each transaction is for.</li>
            <li><strong>Follow up on pending transactions</strong> - Regularly check for transactions that are still in "pending" status.</li>
          </ol>
        </div>
      </div>
      
      <div className="border-t px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentGatewayGuide; 