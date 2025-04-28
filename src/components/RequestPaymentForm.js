import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaTimes, FaCopy, FaCheck } from 'react-icons/fa';

const RequestPaymentForm = ({ onClose }) => {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Generate a unique payment link with the request details
    const requestData = {
      recipient: publicKey.toString(),
      amount,
      description,
      dueDate,
      timestamp: new Date().toISOString(),
    };

    // In a real implementation, this would be a call to your backend to create a payment request
    // For now, we'll create a mock payment link
    const baseUrl = window.location.origin;
    const paymentLinkUrl = `${baseUrl}/pay?data=${encodeURIComponent(JSON.stringify(requestData))}`;
    setPaymentLink(paymentLinkUrl);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Request Payment</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>

      {!paymentLink ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (USDC)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  if (e.target.value === '' || /^\d*\.?\d{0,6}$/.test(e.target.value)) {
                    setAmount(e.target.value);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="What is this payment for?"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Generate Payment Link
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2">Payment link generated successfully!</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={paymentLink}
                readOnly
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="shrink-0 p-3 text-primary hover:text-primary/90 transition-colors"
                title="Copy link"
              >
                {copied ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">Payment request details:</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Amount:</span> {amount} USDC
              </p>
              <p className="text-sm">
                <span className="font-medium">Description:</span> {description}
              </p>
              {dueDate && (
                <p className="text-sm">
                  <span className="font-medium">Due Date:</span> {new Date(dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setPaymentLink('')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create New Request
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPaymentForm; 