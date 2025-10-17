import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  FaRegLightbulb, 
  FaArrowRight, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaInfoCircle, 
  FaWallet, 
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import CustomWalletButton from '../components/CustomWalletButton';
import Confetti from 'react-confetti';
import { sendUSDC } from '../utils/solana';
import { useTransactions } from '../contexts/TransactionsContext';

// Updated utility hook to fetch transaction data using the ID from URL
const usePaymentRequestData = () => {
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        const transactionId = params.get('id');
        
        if (!transactionId) {
          setError('No payment request ID found');
          setLoading(false);
          return;
        }
        
        // Fetch the transaction data from the API
        const apiUrl = process.env.REACT_APP_API_URL || 'https://api.projectsienna.xyz';
        const response = await fetch(`${apiUrl}/api/transactions/${transactionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch transaction details');
        }
        
        const responseData = await response.json();
        const transactionData = responseData.transaction || responseData;
        
        // Format the data as needed for the UI
        const formattedData = {
          sender: {
            name: transactionData.sender_name || 'Sender',
            wallet: transactionData.sender_wallet || '',
            email: transactionData.sender_email || ''
          },
          recipient: {
            name: transactionData.recipient_name || 'Recipient',
            wallet: transactionData.recipient_wallet || '',
            email: transactionData.recipient_email || ''
          },
          request: {
            amount: transactionData.amount || '0',
            description: transactionData.memo || (transactionData.transaction_type === 'invoice_payment' ? 'Invoice Payment' : 'Payment request'),
            dueDate: transactionData.due_date || null,
            id: transactionData.id
          },
          transaction_type: transactionData.transaction_type || 'payment_request',
          invoice_id: transactionData.invoice_id || null
        };
        
        console.log('debug: ', formattedData);
        
        setPaymentData(formattedData);
      } catch (err) {
        console.error('Error fetching transaction data:', err);
        setError(err.message || 'Failed to fetch payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [location]);

  return { paymentData, error, loading };
};

const PayRequestPage = () => {
  const navigate = useNavigate();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { paymentData, error, loading } = usePaymentRequestData();
  const { addTransaction } = useTransactions();
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [transactionSignature, setTransactionSignature] = useState(null);

  // Show confetti animation when the component mounts
  useEffect(() => {
    if (paymentData && !error) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentData, error]);

  // Show confetti on successful payment
  useEffect(() => {
    if (paymentSuccess) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess]);

  const handleContinue = () => {
    setStep(2);
  };

  const handleMakePayment = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet to continue');
      return;
    }

    if (!paymentData.recipient.wallet) {
      setPaymentError('Recipient wallet address is missing');
      return;
    }

    try {
      setProcessing(true);
      setPaymentError(null);

      // Parse amount
      const amount = parseFloat(paymentData.request.amount);
      
      // Create transaction using our utility function
      const tx = await sendUSDC({
        connection,
        fromWallet: publicKey,
        toWallet: paymentData.recipient.wallet,
        amount: amount,
      });

      // Send transaction
      const signature = await sendTransaction(tx, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 5,
      });
      console.log('Transaction sent with signature', signature);
      
      // Wait for confirmation
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      // Check if transaction had any errors
      if (confirmation.value.err) {
        throw new Error(`Transaction failed to confirm: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      console.log('Transaction confirmed successfully');
      setTransactionSignature(signature);

      // Add to transaction history
      addTransaction({
        amount: amount,
        memo: paymentData.request.description || `Payment to ${paymentData.recipient.name}`,
        recipientName: paymentData.recipient.name,
        recipientWallet: paymentData.recipient.wallet,
        senderWallet: publicKey.toString(),
        signature,
        timestamp: new Date().toISOString(),
        type: 'outgoing'
      });

      // Update the payment status in the API
      await updatePaymentStatus(paymentData.request.id, 'paid', signature);

      setPaymentSuccess(true);
      setStep(3);
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Failed to complete payment');
    } finally {
      setProcessing(false);
    }
  };

  // Function to update the payment status in the backend
  const updatePaymentStatus = async (transactionId, status, signature) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.projectsienna.xyz';
      const response = await fetch(`${apiUrl}/api/transactions/${transactionId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          blockchain_tx_id: signature,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update payment status');
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
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

  if (loading || !paymentData) {
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

  // Payment success view
  if (paymentSuccess) {
    return (
      <div className="max-w-3xl mx-auto my-12 px-6">
        {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-primary text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            You have successfully sent {formattedAmount} USDC to {recipient.name}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Transaction Details</h3>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Amount:</span> {formattedAmount} USDC
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Recipient:</span> {recipient.name}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Description:</span> {request.description}
            </p>
            <p className="text-xs font-mono bg-gray-100 p-2 rounded-md break-all">
              {transactionSignature}
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => navigate('/history')}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              View Transaction History
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      
      <div className="max-w-3xl mx-auto my-12 px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-primary bg-opacity-10 p-6 border-b border-primary border-opacity-20">
            <h1 className="text-3xl font-bold text-primary text-center">
              {paymentData?.transaction_type === 'invoice_payment' ? 'Invoice Payment' : 'Payment Request'}
              <span className="inline-block ml-2 animate-bounce">
                <FaMoneyBillWave />
              </span>
            </h1>
            <p className="text-center text-gray-600 mt-2">
              {paymentData?.transaction_type === 'invoice_payment' 
                ? 'You have an invoice to pay' 
                : 'Someone is requesting a payment from you'}
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
                  {sender.wallet && (
                    <p className="text-gray-600">
                      To: {sender.wallet.slice(0, 6)}...{sender.wallet.slice(-4)}
                    </p>
                  )}
                  {sender.name && <p className="text-gray-600 font-medium mt-2">{sender.name}</p>}
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
                  
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-700">Transaction ID</div>
                    <div className="font-mono text-sm">{request.id}</div>
                  </div>
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
                        Sending USDC on Solana typically takes less than 1 second and costs only a fraction of a cent. It&apos;s like teleporting money! ⚡
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
                        To complete this payment, you&apos;ll need:
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
                        
                        {paymentError && (
                          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-left">
                            <p className="font-medium">Error:</p>
                            <p className="text-sm">{paymentError}</p>
                          </div>
                        )}
                        
                        <button
                          onClick={handleMakePayment}
                          disabled={processing}
                          className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-lg transition-colors w-full flex items-center justify-center"
                        >
                          {processing ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" /> Processing Payment...
                            </>
                          ) : (
                            <>Pay {formattedAmount} USDC</>
                          )}
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                      disabled={processing}
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