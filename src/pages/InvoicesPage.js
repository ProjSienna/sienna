import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaFileInvoiceDollar, FaClock, FaSpinner, FaExclamationTriangle, FaUser, FaCalendarAlt, FaWallet } from 'react-icons/fa';
import InvoiceForm from '../components/InvoiceForm';
import { formatWalletAddress } from '../utils/solana';

const InvoicesPage = () => {
  const { publicKey } = useWallet();
  const [requestedPayments, setRequestedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // If user is not authenticated, redirect to landing page
  if (!publicKey) {
    return <Navigate to="/landing" />;
  }

  // Fetch requested payments on component mount
  useEffect(() => {
    const fetchRequestedPayments = async () => {
      if (!publicKey) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = process.env.REACT_APP_API_URL || 'http://api.projectsienna.xyz';
        const response = await fetch(`${apiUrl}/api/transactions/requested/${publicKey.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch requested payments: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setRequestedPayments(data);
      } catch (err) {
        console.error('Error fetching requested payments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestedPayments();
  }, [publicKey]);

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render requested payment card
  const RequestedPaymentCard = ({ payment }) => (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header with amount and status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-2 rounded-full mr-3">
                <FaClock className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  ${payment.amount} USDC
                </h3>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  {payment.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <FaUser className="mr-2 text-gray-400" />
              <span className="font-medium">From:</span>
              <span className="ml-1">{payment.recipient_name || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaWallet className="mr-2 text-gray-400" />
              <span className="font-medium">Sender:</span>
              <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">
                {formatWalletAddress(payment.sender_wallet)}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <FaCalendarAlt className="mr-2 text-gray-400" />
              <span className="font-medium">Requested:</span>
              <span className="ml-1">{formatDate(payment.timestamp)}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <FaWallet className="mr-2 text-gray-400" />
              <span className="font-medium">To:</span>
              <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">
                {formatWalletAddress(payment.recipient_wallet)}
              </span>
            </div>
          </div>

          {/* Memo */}
          {payment.memo && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium text-gray-700">Memo:</span>
              <p className="text-sm text-gray-600 mt-1">{payment.memo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Create Invoice Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-secondary bg-opacity-10 p-3 rounded-md mr-4">
            <FaFileInvoiceDollar className="text-2xl text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoice Management</h1>
            <p className="text-gray-600">Create and manage invoices for your business</p>
          </div>
        </div>
        
        <InvoiceForm />
      </div>

      {/* Requested Payments Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center mb-6">
          <div className="bg-yellow-100 p-3 rounded-md mr-4">
            <FaClock className="text-2xl text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Requested Payments</h2>
            <p className="text-gray-600">Payment requests awaiting your action</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-primary mr-3" />
            <span className="text-lg text-gray-600">Loading requested payments...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FaExclamationTriangle className="text-4xl text-red-500 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Payments</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Payments State */}
        {!loading && !error && requestedPayments.length === 0 && (
          <div className="text-center py-12">
            <FaClock className="text-4xl text-gray-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Requested Payments</h3>
            <p className="text-gray-500">You don't have any pending payment requests at the moment.</p>
          </div>
        )}

        {/* Payments List */}
        {!loading && !error && requestedPayments.length > 0 && (
          <div>
            <div className="mb-4 text-sm text-gray-600">
              Showing {requestedPayments.length} requested payment{requestedPayments.length !== 1 ? 's' : ''}
            </div>
            <div className="space-y-4">
              {requestedPayments.map((payment) => (
                <RequestedPaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
