import React, { useState } from 'react';
import { FaCode, FaCopy, FaCheck, FaReact, FaPython, FaTerminal, FaGlobe, FaLightbulb } from 'react-icons/fa';

const ApiPage = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [activeTabs, setActiveTabs] = useState({});

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
      id: 'payment-request',
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
    "dueDate": "2023-08-15",
    "paymentLink": "https://example.com/pay/tx123456"
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
      dueDate: '2023-08-15',
      paymentLink: 'https://example.com/pay/tx123456'
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
    "dueDate": "2023-08-15",
    "paymentLink": "https://example.com/pay/tx123456"
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
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sienna API Documentation</h1>
        <p className="text-xl text-gray-600 mb-6">
          Integrate payment functionality in your applications with our API endpoints.
        </p>
        <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <div className="flex items-start">
            <FaGlobe className="text-blue-500 text-2xl mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Base URL</h3>
              <p className="text-gray-700 mb-3">All API endpoints are available at the following base URL:</p>
              <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm mb-3">
                https://api.projectsienna.xyz
              </div>
              <p className="text-sm text-blue-700">
                Set <code className="bg-blue-100 px-1 py-0.5 rounded">REACT_APP_API_URL</code> in your environment variables to use a different URL for development.
              </p>
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

      <div className="space-y-16">
        {endpoints.map((endpoint) => (
          <div key={endpoint.id} id={endpoint.id} className="scroll-mt-24">
            <div className="flex items-center mb-4">
              <FaCode className="text-primary text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">{endpoint.title}</h2>
            </div>
            <p className="text-gray-600 mb-6">{endpoint.description}</p>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <span className={`inline-block px-3 py-1 text-sm rounded-md font-medium ${endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {endpoint.method}
                </span>
                <span className="ml-3 font-mono text-gray-700">{endpoint.endpoint}</span>
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
              <div className="flex border-b border-gray-200">
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
                <pre className="p-6 overflow-x-auto text-sm">
                  <code className={`language-${getActiveCode(endpoint).language}`}>{getActiveCode(endpoint).code}</code>
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
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
                <code className="language-json">{`{
  "success": true,
  "message": "Payment request email sent successfully",
  "data": {
    "id": "bf225204-ea42-4fe2-b7db-4c7a5385da36",
    "sentAt": "2023-08-10T14:25:16.253Z"
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