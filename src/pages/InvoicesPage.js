import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  FaFileInvoiceDollar, 
  FaClock, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaUser, 
  FaCalendarAlt, 
  FaWallet,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaBuilding,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaDollarSign,
  FaEnvelope
} from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';

const InvoicesPage = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [requestedPayments, setRequestedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState({
    total: 0,
    paid: 0,
    sent: 0,
    draft: 0
  });
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  // Fetch invoices from backend API
  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      
      // Fetch all invoices
      const response = await fetch(`${apiUrl}/api/invoices`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      
      const data = await response.json();
      console.log('Fetched invoices data:', data);
      
      if (data.success && data.invoices) {
        // Debug: Log first invoice to see structure
        if (data.invoices.length > 0) {
          console.log('First invoice structure:', data.invoices[0]);
          console.log('First invoice ID:', data.invoices[0].id);
        }
        
        // Sort by created_at descending (most recent first)
        const sortedInvoices = data.invoices.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setRecentInvoices(sortedInvoices);
        
        // Calculate stats
        const stats = {
          total: sortedInvoices.length,
          paid: sortedInvoices.filter(inv => inv.status === 'paid').length,
          sent: sortedInvoices.filter(inv => inv.status === 'sent').length,
          draft: sortedInvoices.filter(inv => inv.status === 'draft').length
        };
        setInvoiceStats(stats);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      // Set empty array on error so UI shows "No Invoices Yet"
      setRecentInvoices([]);
    } finally {
      setInvoicesLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Load business info from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('businessInfo');
    if (stored) {
      setBusinessInfo(JSON.parse(stored));
    }
  }, []);

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

  // If user is not authenticated, redirect to landing page
  if (!publicKey) {
    return <Navigate to="/landing" />;
  }

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

  // Get status color and icon
  const getStatusDisplay = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FaEdit },
      sent: { color: 'bg-blue-100 text-blue-800', icon: FaPaperPlane },
      paid: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle }
    };
    return statusConfig[status] || statusConfig.draft;
  };

  // Compact Business Info Card
  const CompactBusinessInfoCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
      <div className="flex items-center mb-3">
        <div className="bg-blue-100 p-2 rounded-full mr-3">
          <FaBuilding className="text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Business Info</h3>
      </div>
      
      {businessInfo ? (
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium text-gray-600">Name:</span>
            <p className="text-sm text-gray-800">{businessInfo.name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <p className="text-sm text-gray-800">{businessInfo.email}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Address:</span>
            <p className="text-sm text-gray-800">{businessInfo.city}, {businessInfo.state}</p>
          </div>
          <button 
            onClick={() => navigate('/business-info')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
          >
            Edit Business Info →
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-3">Set up your business information</p>
          <button 
            onClick={() => navigate('/business-info')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            Setup Business Info
          </button>
        </div>
      )}
    </div>
  );

  // Quick Actions Card
  const QuickActionsCard = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
      <div className="flex items-center mb-3">
        <div className="bg-green-100 p-2 rounded-full mr-3">
          <FaChartLine className="text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={() => navigate('/invoices/create')}
          className="w-full bg-primary text-white px-4 py-3 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center"
        >
          <FaPlus className="mr-2" />
          Create New Invoice
        </button>
        
        <button 
          onClick={() => navigate('/invoices/all')}
          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <FaEye className="mr-2" />
          View All Invoices
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {invoicesLoading ? (
          <div className="text-center py-2">
            <FaSpinner className="animate-spin text-gray-400 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-800">{invoiceStats.total}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">
                {invoiceStats.paid}
              </p>
              <p className="text-xs text-gray-600">Paid</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-600">
                {invoiceStats.sent}
              </p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Recent Invoice Card
  const RecentInvoiceCard = ({ invoice }) => {
    const [sending, setSending] = useState(false);
    const statusDisplay = getStatusDisplay(invoice.status);
    const StatusIcon = statusDisplay.icon;
    
    // Format the total_due as a number (it comes as a Decimal from Prisma)
    const totalAmount = typeof invoice.total_due === 'string' 
      ? parseFloat(invoice.total_due) 
      : invoice.total_due;
    
    // Get payment status badge
    const getPaymentStatusBadge = (paymentStatus) => {
      const badges = {
        paid: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, text: 'Paid' },
        unpaid: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'Unpaid' },
        partial: { color: 'bg-blue-100 text-blue-800', icon: FaDollarSign, text: 'Partial' },
        overdue: { color: 'bg-red-100 text-red-800', icon: FaTimesCircle, text: 'Overdue' }
      };
      return badges[paymentStatus] || badges.unpaid;
    };
    
    const paymentBadge = getPaymentStatusBadge(invoice.payment_status);
    const PaymentIcon = paymentBadge.icon;
    
    // Send invoice email
    const handleSendEmail = async () => {
      // Debug: Log the invoice object to see its structure
      console.log('Invoice object:', invoice);
      console.log('Invoice ID:', invoice.id);
      
      // Validation checks
      if (!invoice.id) {
        alert('❌ Invoice ID is missing. Please refresh the page and try again.');
        console.error('Invoice object missing ID:', invoice);
        return;
      }
      
      if (!invoice.client_email) {
        alert('❌ Client email is required to send invoice. Please add a client email to this invoice first.');
        return;
      }
      
      if (!publicKey) {
        alert('❌ Please connect your wallet first to generate a payment link.');
        return;
      }
      
      // Confirm before sending
      const confirmSend = window.confirm(
        `📧 Send invoice ${invoice.invoice_number} to ${invoice.client_email}?\n\n` +
        `This will:\n` +
        `• Send a professional email to the client\n` +
        `• Include a payment link for ${parseFloat(invoice.total_due).toFixed(2)} ${invoice.currency || 'USD'}\n` +
        `• Update the invoice status to "sent"`
      );
      
      if (!confirmSend) {
        return;
      }
      
      setSending(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        console.log(`Sending invoice email to: ${invoice.client_email}`);
        console.log(`Payment wallet: ${publicKey.toString()}`);
        
        const response = await fetch(`${apiUrl}/api/invoices/${invoice.id}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            paymentWalletAddress: publicKey.toString()
          })
        });
        
        const data = await response.json();
        console.log('Email send response:', data);
        
        if (response.ok && data.success) {
          alert(`✅ Invoice email sent successfully!\n\n` +
                `📧 Sent to: ${invoice.client_email}\n` +
                `📄 Invoice: ${invoice.invoice_number}\n` +
                `💰 Amount: $${parseFloat(invoice.total_due).toFixed(2)} ${invoice.currency || 'USD'}\n\n` +
                `The invoice list will refresh to show the updated status.`);
          
          // Refresh the invoice data to show updated status
          await fetchInvoices();
        } else {
          // Handle API errors
          const errorMessage = data.message || 'Unknown error occurred';
          console.error('Email send failed:', data);
          alert(`❌ Failed to send invoice email:\n\n${errorMessage}\n\nPlease check:\n• Your internet connection\n• Backend server is running\n• Email service is configured`);
        }
      } catch (error) {
        console.error('Error sending invoice email:', error);
        
        // More specific error messages
        let errorMessage = 'Failed to send invoice email';
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (error.message.includes('NetworkError')) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        alert(`❌ ${errorMessage}\n\nError details: ${error.message}`);
      } finally {
        setSending(false);
      }
    };
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center flex-wrap gap-2">
                <h4 className="text-lg font-semibold text-gray-800">
                  {invoice.invoice_number}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusDisplay.color}`}>
                  <StatusIcon className="mr-1" />
                  {invoice.status.toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${paymentBadge.color}`}>
                  <PaymentIcon className="mr-1" />
                  {paymentBadge.text}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-800">${totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">USD</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <FaUser className="mr-2 text-gray-400" />
                <span>{invoice.client_name}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                <span>Due: {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <FaCalendarAlt className="mr-2 text-gray-400" />
                <span>Created: {new Date(invoice.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            {invoice.email_sent_at && (
              <span className="text-xs text-gray-500 flex items-center">
                <FaEnvelope className="mr-1" />
                Sent {new Date(invoice.email_sent_at).toLocaleDateString()}
              </span>
            )}
            {invoice.payment_link && (
              <span className="text-xs text-blue-600 flex items-center">
                <FaWallet className="mr-1" />
                Payment link active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/invoices/${invoice.id}/view`, '_blank')}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors"
              title="View Invoice"
            >
              <FaEye />
            </button>
            <button 
              className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-50 transition-colors"
              title="Edit Invoice"
            >
              <FaEdit />
            </button>
            <button 
              onClick={handleSendEmail}
              disabled={sending || !invoice.client_email}
              className={`p-2 rounded-md transition-colors ${
                sending || !invoice.client_email
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-green-600 hover:text-green-800 hover:bg-green-50'
              }`}
              title={!invoice.client_email ? 'Client email required' : invoice.email_sent_at ? 'Resend Invoice' : 'Send Invoice'}
            >
              {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
            <button 
              className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors"
              title="Delete Invoice"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    );
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
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-secondary bg-opacity-10 p-3 rounded-md mr-4">
            <FaFileInvoiceDollar className="text-3xl text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Invoice Dashboard</h1>
            <p className="text-gray-600">Manage your business info, invoices, and payment requests</p>
          </div>
        </div>
      </div>

      {/* Top Section: Business Info + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CompactBusinessInfoCard />
        <QuickActionsCard />
      </div>

      {/* Recent Invoices Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-md mr-4">
              <FaFileInvoiceDollar className="text-2xl text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Recent Invoices</h2>
              <p className="text-gray-600">Your latest invoice activity</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/invoices/all')}
            className="text-primary hover:text-primary-dark font-medium"
          >
            View All →
          </button>
        </div>

        {invoicesLoading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-primary mr-3" />
            <span className="text-lg text-gray-600">Loading invoices...</span>
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FaFileInvoiceDollar className="text-4xl text-gray-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Invoices Yet</h3>
            <p className="text-gray-500 mb-4">Create your first invoice to get started.</p>
            <button 
              onClick={() => navigate('/invoices/create')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentInvoices.slice(0, 3).map((invoice, index) => (
              <RecentInvoiceCard 
                key={invoice.id || invoice.invoice_number || `invoice-${index}`} 
                invoice={invoice} 
              />
            ))}
          </div>
        )}
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
            <p className="text-gray-500">You don&apos;t have any pending payment requests at the moment.</p>
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
