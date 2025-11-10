import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const uint8ArrayToBase64 = (bytes) => {
  let binary = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== 'undefined' ? window.btoa(binary) : Buffer.from(bytes).toString('base64');
};

/**
 * X402PaymentWidget - A reusable component for X402 protocol payments
 * 
 * Props:
 * - endpoint: The API endpoint to fetch payment requirements from
 * - amount: Optional custom amount in USDC
 * - description: Optional payment description
 * - onPaymentSuccess: Callback function when payment is successful
 * - onPaymentError: Callback function when payment fails
 */
const X402PaymentWidget = ({
  endpoint,
  amount = null,
  description = null,
  network = 'devnet',
  onPaymentSuccess = null,
  onPaymentError = null,
}) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  
  const [x402Response, setX402Response] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, error
  const [transactionSignature, setTransactionSignature] = useState(null);

  // Fetch payment requirements from the endpoint
  useEffect(() => {
    const fetchPaymentRequirements = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (amount) params.append('amount', amount);
        if (description) params.append('description', description);
        if (network) params.append('network', network);

        const queryString = params.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        const response = await fetch(url);
        
        if (response.status === 402) {
          const data = await response.json();
          
          // Validate X402Response format
          if (!data || !Array.isArray(data.accepts) || data.accepts.length === 0) {
            throw new Error('Invalid X402Response format');
          }

          setX402Response(data);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching payment requirements:', err);
        setError(err.message);
        if (onPaymentError) onPaymentError(err);
      } finally {
        setLoading(false);
      }
    };

    if (endpoint) {
      fetchPaymentRequirements();
    }
  }, [endpoint, amount, description, network]);

  // Process payment
  const handlePayment = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!x402Response || !x402Response.accepts || x402Response.accepts.length === 0) {
      setError('No payment options available');
      return;
    }

    try {
      if (!signTransaction) {
        throw new Error('Connected wallet does not support direct transaction signing.');
      }

      setPaymentStatus('processing');
      setError(null);

      // Get the first payment option (can be extended to support multiple)
      const paymentOption = x402Response.accepts[0];

      if (!paymentOption) {
        throw new Error('Payment option not available');
      }

      const mintAddress = paymentOption.extra?.mint;
      if (!mintAddress) {
        throw new Error('Missing USDC mint in payment requirements');
      }

      // Extract payment details
      const recipientAddress = new PublicKey(paymentOption.payTo);
      const amountInSmallestUnits = Number(paymentOption.maxAmountRequired);
      if (Number.isNaN(amountInSmallestUnits)) {
        throw new Error('Invalid payment amount received from server');
      }
      
      // Get USDC mint address from extra data
      const usdcMint = new PublicKey(mintAddress);
      
      // Get sender's token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        usdcMint,
        publicKey
      );

      const instructions = [];

      // Ensure recipient token account exists, create if needed
      const recipientAccountInfo = await connection.getAccountInfo(recipientAddress);
      if (!recipientAccountInfo) {
        const recipientWalletAddress = paymentOption.extra?.recipientWallet;
        if (!recipientWalletAddress) {
          throw new Error('Missing recipient wallet address in payment requirements');
        }

        instructions.push(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientAddress,
            new PublicKey(recipientWalletAddress),
            usdcMint
          )
        );
      }

      // Create transfer instruction
      instructions.push(
        createTransferInstruction(
          senderTokenAccount,
          recipientAddress,
          publicKey,
          amountInSmallestUnits,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Create transaction
      const transaction = new Transaction().add(...instructions);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Ask wallet to sign the transaction but do not submit on the client
      const signedTransaction = await signTransaction(transaction);
      const serializedTx = signedTransaction.serialize();

      // Submit the signed transaction to the backend for final processing
      const backendResult = await submitPaymentProof(serializedTx, paymentOption);

      const backendSignature = backendResult?.paymentDetails?.signature;
      if (backendSignature) {
        setTransactionSignature(backendSignature);
      }

      setPaymentStatus('success');

      if (onPaymentSuccess) {
        onPaymentSuccess({
          signature: backendSignature,
          amount: amountInSmallestUnits / 1000000,
          asset: paymentOption.asset,
          network: paymentOption.network,
          paymentDetails: backendResult?.paymentDetails,
          data: backendResult?.data
        });
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      setPaymentStatus('error');
      if (onPaymentError) onPaymentError(err);
    }
  };

  // Submit payment proof to backend
  const submitPaymentProof = async (serializedTxBytes, paymentOption) => {
    try {
      const serializedTx = uint8ArrayToBase64(serializedTxBytes);
      
      // Create X-Payment header
      const paymentProof = {
        network: paymentOption.network,
        payload: {
          serializedTransaction: serializedTx
        }
      };
      
      const xPaymentHeader = typeof window !== 'undefined'
        ? window.btoa(JSON.stringify(paymentProof))
        : Buffer.from(JSON.stringify(paymentProof)).toString('base64');
      
      // Submit to backend
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'X-Payment': xPaymentHeader
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Payment verified by backend:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('Backend verification failed:', errorText);
        throw new Error(errorText || 'Backend verification failed');
      }
    } catch (err) {
      console.error('Error submitting payment proof:', err);
      throw err;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading payment details...</span>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !x402Response) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-800 font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  // Render payment widget
  if (x402Response && x402Response.accepts && x402Response.accepts.length > 0) {
    const paymentOption = x402Response.accepts[0];
    const amountInSmallestUnits = Number(paymentOption.maxAmountRequired);
    const amountUSDC = paymentOption.extra?.amountUSDC ?? (Number.isNaN(amountInSmallestUnits) ? '-' : amountInSmallestUnits / 1_000_000);

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Required</h3>
          <p className="text-gray-600">{paymentOption.description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="text-lg font-semibold text-gray-800">
                {amountUSDC} {paymentOption.asset}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Network</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">
                {paymentOption.network}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Scheme</p>
              <p className="text-lg font-semibold text-gray-800 capitalize">
                {paymentOption.scheme}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Timeout</p>
              <p className="text-lg font-semibold text-gray-800">
                {paymentOption.maxTimeoutSeconds}s
              </p>
            </div>
          </div>
        </div>

        {paymentStatus === 'idle' && (
          <button
            onClick={handlePayment}
            disabled={!publicKey}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              publicKey
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {publicKey ? `Pay ${amountUSDC} ${paymentOption.asset}` : 'Connect Wallet to Pay'}
          </button>
        )}

        {paymentStatus === 'processing' && (
          <div className="flex items-center justify-center py-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Processing payment...</span>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-semibold">Payment Successful!</span>
            </div>
            {transactionSignature && (
              <a
                href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=${paymentOption.network}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View transaction on Solana Explorer
              </a>
            )}
          </div>
        )}

        {paymentStatus === 'error' && error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 font-medium">Payment failed: {error}</span>
            </div>
            <button
              onClick={handlePayment}
              className="mt-3 w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
            >
              Retry Payment
            </button>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>X402 Protocol v{x402Response.x402Version}</p>
          <p className="mt-1">Resource: {paymentOption.resource}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default X402PaymentWidget;
