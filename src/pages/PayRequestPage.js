import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaRegLightbulb, FaArrowRight, FaMoneyBillWave, FaCalendarAlt, FaInfoCircle, FaWallet, FaArrowLeft } from 'react-icons/fa';
import CustomWalletButton from '../components/CustomWalletButton';
import Confetti from 'react-confetti';

// Utility function to extract and parse data from URL
const usePaymentRequestData = () => {
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);

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

  return { paymentData, error };
};

const PayRequestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { connected } = useWallet();
  const { paymentData, error } = usePaymentRequestData();
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  // Show confetti animation when the component mounts
  useEffect(() => {
    if (paymentData && !error) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentData, error]);

  // Proceed directly to payment when user clicks the button
  const startPayment = () => {
    navigate(`/payment?data=${encodeURIComponent(JSON.stringify(paymentData))}`);
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto my-12 px-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaInfoCircle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <FaArrowLeft className="inline mr-2" />
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="max-w-lg mx-auto my-12 px-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading payment request...</h2>
        </div>
      </div>
    );
  }

  const { sender, recipient, request } = paymentData;
  
  // Format the amount with 2 decimal places
  const formattedAmount = parseFloat(request.amount).toFixed(2);
  
  // Format the due date if it exists
  const formattedDueDate = request.dueDate ? new Date(request.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  const handleContinue = () => {
    setStep(2);
  };

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-3xl mx-auto my-12 px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary bg-opacity-10 p-6 border-b border-primary border-opacity-20">
            <h1 className="text-3xl font-bold text-primary text-center">
              Payment Request 
              <span className="inline-block ml-2 animate-bounce">
                <FaMoneyBillWave />
              </span>
            </h1>
            <p className="text-center text-gray-600 mt-2">
              Someone is requesting a payment from you
            </p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {step === 1 ? (
              <div className="space-y-8">
                {/* Amount */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2 animate-pulse">
                    {formattedAmount} <span className="text-3xl">USDC</span>
                  </div>
                  <p className="text-gray-600">
                    From: {sender.wallet.slice(0, 6)}...{sender.wallet.slice(-4)}
                  </p>
                </div>
                
                {/* Payment Details */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-700">To</div>
                    <div className="font-semibold">{recipient.name}</div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-700">For</div>
                    <div>{request.description}</div>
                  </div>
                  
                  {formattedDueDate && (
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-gray-700">
                        <FaCalendarAlt className="inline mr-2" />
                        Due Date
                      </div>
                      <div>{formattedDueDate}</div>
                    </div>
                  )}
                </div>
                
                {/* Fun Tips */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaRegLightbulb className="text-blue-500 text-xl mt-1" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-blue-800">Quick Tip</h3>
                      <p className="text-blue-700 text-sm">
                        Sending USDC on Solana typically takes less than 1 second and costs only a fraction of a cent. It's like teleporting money! ⚡
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Continue Button */}
                <div className="text-center pt-4">
                  <button 
                    onClick={handleContinue}
                    className="bg-secondary hover:bg-secondary/90 text-dark font-medium px-8 py-3 rounded-lg transition-colors"
                  >
                    Continue <FaArrowRight className="inline ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-yellow-50 rounded-xl p-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaInfoCircle className="text-yellow-500 text-xl mt-1" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-yellow-800">Before You Pay</h3>
                      <p className="text-yellow-700 text-sm mb-2">
                        To complete this payment, you'll need:
                      </p>
                      <ul className="text-yellow-700 text-sm list-disc list-inside space-y-1">
                        <li>A Solana wallet (like Phantom or Solflare)</li>
                        <li>USDC tokens in your wallet (at least {formattedAmount} USDC)</li>
                        <li>A tiny bit of SOL for transaction fees (less than 0.001 SOL)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-center font-semibold text-lg mb-4">Ready to pay {formattedAmount} USDC?</h3>
                  
                  <div className="text-center space-y-6">
                    {!connected ? (
                      <div className="space-y-4">
                        <p className="text-gray-600">First, connect your wallet:</p>
                        <div className="flex justify-center">
                          <CustomWalletButton />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center">
                          <FaWallet className="mr-2" /> Wallet connected successfully!
                        </div>
                        <button
                          onClick={startPayment}
                          className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                        >
                          Proceed to Payment
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      <FaArrowLeft className="inline mr-1" />
                      Back to details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PayRequestPage; 