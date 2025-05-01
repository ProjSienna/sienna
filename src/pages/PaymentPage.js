import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentForm from '../components/PaymentForm';
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Parse data from URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const encodedData = params.get('data');
      
      if (!encodedData) {
        setError('No payment request data found');
        return;
      }
      
      const decodedData = JSON.parse(decodeURIComponent(encodedData));
      setPaymentData(decodedData);
    } catch (err) {
      console.error('Error parsing payment request data:', err);
      setError('Invalid payment request format');
    }
  }, [location]);

  // Convert payment request data to format expected by PaymentForm
  const getPayeeFromRequestData = () => {
    if (!paymentData) return null;
    
    const { recipient, request } = paymentData;
    return {
      id: Date.now().toString(), // Generate a temporary ID
      name: recipient.name,
      email: recipient.email || '',
      walletAddress: recipient.wallet,
      amount: parseFloat(request.amount),
      category: request.relationship || 'other'
    };
  };

  const handlePaymentSuccess = (transaction) => {
    setPaymentComplete(true);
    // Could add additional success handling here
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto my-8 bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Error Loading Payment</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center mx-auto text-primary hover:text-primary/90"
          >
            <FaArrowLeft className="mr-2" />
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="max-w-lg mx-auto my-8 bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment data...</p>
        </div>
      </div>
    );
  }

  const payee = getPayeeFromRequestData();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/pay' + location.search)}
          className="flex items-center text-primary hover:text-primary/90"
        >
          <FaArrowLeft className="mr-2" />
          Back to payment details
        </button>
      </div>

      {paymentComplete ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your payment of {payee.amount} USDC to {payee.name} was successful.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/history')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Transaction History
            </button>
            <button
              onClick={() => navigate('/')}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      ) : (
        <PaymentForm 
          payee={payee} 
          onSuccess={handlePaymentSuccess} 
          onCancel={() => navigate('/pay' + location.search)}
        />
      )}
    </div>
  );
};

export default PaymentPage; 