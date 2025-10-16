import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  FaFileInvoiceDollar, 
  FaArrowLeft, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaEdit,
  FaTrash,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSpinner
} from 'react-icons/fa';

const AllInvoicesPage = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch invoices from API - only when component mounts
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!publicKey) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        console.log('Fetching all invoices from:', `${apiUrl}/api/invoices`);
        
        const response = await fetch(`${apiUrl}/api/invoices`);
        if (!response.ok) {
          throw new Error(`Failed to fetch invoices: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('All invoices fetched:', data);
        
        if (data.success && data.invoices) {
          setInvoices(data.invoices);
        } else {
          throw new Error(data.message || 'Failed to load invoices');
        }
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err.message);
        setInvoices([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [publicKey]); // Only re-fetch if publicKey changes

  // Filter and sort invoices
  useEffect(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = (invoice.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = parseFloat(a.total_due || 0);
          bValue = parseFloat(b.total_due || 0);
          break;
        case 'client_name':
          aValue = (a.client_name || '').toLowerCase();
          bValue = (b.client_name || '').toLowerCase();
          break;
        case 'due_date':
          aValue = new Date(a.due_date || 0);
          bValue = new Date(b.due_date || 0);
          break;
        default: // created_at
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, sortBy, sortOrder]);

  // If user is not authenticated, redirect to landing page
  if (!publicKey) {
    return <Navigate to="/landing" />;
  }

  // Get status color and icon - show "pending" for all non-paid invoices
  const getStatusDisplay = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: FaCheckCircle, text: 'Paid' },
      // All other statuses show as "pending"
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'Pending' },
      sent: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'Pending' },
      overdue: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'Pending' }
    };
    return statusConfig[status] || statusConfig.draft;
  };

  const InvoiceRow = ({ invoice }) => {
    const statusDisplay = getStatusDisplay(invoice.status);
    const StatusIcon = statusDisplay.icon;
    
    // Format amount safely
    const amount = parseFloat(invoice.total_due || 0).toFixed(2);
    
    // Format dates safely
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch {
        return 'N/A';
      }
    };
    
    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-900">{invoice.invoice_number || 'N/A'}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-gray-900">{invoice.client_name || 'N/A'}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-semibold text-gray-900">${amount}</div>
          <div className="text-sm text-gray-500">{invoice.currency || 'USD'}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusDisplay.color}`}>
            <StatusIcon className="mr-1" />
            {statusDisplay.text}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatDate(invoice.due_date)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatDate(invoice.created_at)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <button 
              onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/invoices/${invoice.id}/view`, '_blank')}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
              title="View Invoice"
            >
              <FaEye />
            </button>
            <button 
              onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
              className="text-gray-600 hover:text-gray-800 p-1 rounded-md hover:bg-gray-50 transition-colors"
              title="Edit Invoice"
            >
              <FaEdit />
            </button>
            {invoice.status !== 'paid' && invoice.client_email && (
              <button 
                className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-50 transition-colors"
                title="Send Email"
              >
                <FaPaperPlane />
              </button>
            )}
            <button 
              className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
              title="Delete Invoice"
            >
              <FaTrash />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => navigate('/invoices')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-md mr-4">
              <FaFileInvoiceDollar className="text-3xl text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">All Invoices</h1>
              <p className="text-gray-600">Manage and track all your invoices</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/invoices/create')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
          >
            <FaPlus className="mr-2" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="created_date">Sort by Created Date</option>
              <option value="due_date">Sort by Due Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="client_name">Sort by Client</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              {sortOrder === 'asc' ? <FaSortAmountUp className="mr-2" /> : <FaSortAmountDown className="mr-2" />}
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {!loading && !error && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {filteredInvoices.length} Invoice{filteredInvoices.length !== 1 ? 's' : ''}
              </h2>
              <div className="text-sm text-gray-600">
                Total Value: ${filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_due || 0), 0).toLocaleString()} {filteredInvoices[0]?.currency || 'USD'}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-primary mr-3" />
            <span className="text-lg text-gray-600">Loading invoices...</span>
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-12">
            <FaTimesCircle className="text-4xl text-red-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Error Loading Invoices</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <FaFileInvoiceDollar className="text-4xl text-gray-400 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Invoices Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Create your first invoice to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button 
                onClick={() => navigate('/invoices/create')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Create Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllInvoicesPage;
