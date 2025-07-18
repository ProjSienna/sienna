import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaArrowLeft, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey } = useWallet();
  
  // Get payee data from navigation state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    dueDate: '',
    payeeName: '',
    payeeWallet: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize form with payee data if available
  useEffect(() => {
    if (location.state?.payee) {
      const { name, walletAddress, amount, description } = location.state.payee;
      setFormData(prev => ({
        ...prev,
        payeeName: name || '',
        payeeWallet: walletAddress || '',
        amount: amount || '',
        description: description || ''
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!formData.payeeWallet) {
      setError('Payee wallet address is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Here you would typically make an API call to your backend to create the invoice
      // For now, we'll just log it and show success
      console.log('Creating invoice:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Redirect back to invoices page after a short delay
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // If wallet is not connected, show message
  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please connect your wallet to create an invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back button */}
      <button
        onClick={handleBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Invoice</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Invoice Created!</h3>
              <p className="mt-2 text-sm text-gray-500">Your invoice has been successfully created.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/invoices')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  View All Invoices
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Payee Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Bill To</h3>
                  
                  <div>
                    <label htmlFor="payeeName" className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      id="payeeName"
                      name="payeeName"
                      value={formData.payeeName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Payee name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="payeeWallet" className="block text-sm font-medium text-gray-700">Wallet Address</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <input
                        type="text"
                        id="payeeWallet"
                        name="payeeWallet"
                        value={formData.payeeWallet}
                        onChange={handleChange}
                        className="block w-full pr-10 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Wallet address"
                        required
                      />
                    </div>
                    {formData.payeeWallet && (
                      <p className="mt-1 text-xs text-gray-500">
                        {formatWalletAddress(formData.payeeWallet)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Invoice Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (USDC)</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="focus:ring-primary focus:border-primary block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm" id="price-currency">
                          USDC
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="date"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-primary focus:border-primary mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                    placeholder="Add a description for this invoice..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="-ml-1 mr-2 h-4 w-4" />
                      Create Invoice
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;
