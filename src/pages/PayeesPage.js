import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePayees } from '../contexts/PayeesContext';
import { useTransactions } from '../contexts/TransactionsContext';
import PayeeCard from '../components/PayeeCard';
import PayeeForm from '../components/PayeeForm';
import PaymentForm from '../components/PaymentForm';
import TransactionCard from '../components/TransactionCard';
import { FaPlus, FaSearch, FaWallet, FaHistory, FaFileExport, FaMoneyBillWave, FaUsers } from 'react-icons/fa';

const PayeesPage = () => {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { payees, deletePayee } = usePayees();
  const { transactions } = useTransactions();
  const [showAddForm, setShowAddForm] = useState(false);
  const [payeeToEdit, setPayeeToEdit] = useState(null);
  const [payeeToPayment, setPayeeToPayment] = useState(null);
  const [payeeSearchTerm, setPayeeSearchTerm] = useState('');
  const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'incoming', 'outgoing'

  // Navigate to payroll page
  const handleRunPayroll = () => {
    navigate('/payroll/run');
  };

  // Filter payees by search term
  const filteredPayees = payees.filter(payee => 
    payee.name.toLowerCase().includes(payeeSearchTerm.toLowerCase()) ||
    payee.walletAddress.toLowerCase().includes(payeeSearchTerm.toLowerCase()) ||
    (payee.description && payee.description.toLowerCase().includes(payeeSearchTerm.toLowerCase()))
  );

  // Filter transactions based on search term and type
  const filteredTransactions = transactions.filter(transaction => {
    // First apply type filter
    if (filterType === 'incoming' && transaction.senderWallet === publicKey?.toString()) {
      return false;
    }
    if (filterType === 'outgoing' && transaction.recipientWallet === publicKey?.toString()) {
      return false;
    }
    
    // Then apply search filter
    if (!transactionSearchTerm) return true;
    
    const searchTermLower = transactionSearchTerm.toLowerCase();
    return (
      (transaction.recipientName && transaction.recipientName.toLowerCase().includes(searchTermLower)) ||
      (transaction.senderName && transaction.senderName.toLowerCase().includes(searchTermLower)) ||
      transaction.recipientWallet.toLowerCase().includes(searchTermLower) ||
      transaction.senderWallet.toLowerCase().includes(searchTermLower) ||
      (transaction.memo && transaction.memo.toLowerCase().includes(searchTermLower))
    );
  });

  const handleAddClick = () => {
    setPayeeToEdit(null);
    setShowAddForm(true);
  };

  const handleEditClick = (payee) => {
    setPayeeToEdit(payee);
    setShowAddForm(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this payee?')) {
      deletePayee(id);
    }
  };

  const handlePayClick = (payee) => {
    setPayeeToPayment(payee);
  };

  const handleInvoiceClick = (payee) => {
    navigate('/invoices/create', { 
      state: { 
        payee: {
          name: payee.name,
          walletAddress: payee.walletAddress,
          amount: payee.amount || '',
          description: payee.description || ''
        }
      } 
    });
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setPayeeToEdit(null);
  };

  const handlePaymentClose = () => {
    setPayeeToPayment(null);
  };

  const exportTransactions = () => {
    // Format transactions for CSV
    const csvData = filteredTransactions.map(tx => {
      const isOutgoing = publicKey && tx.senderWallet === publicKey.toString();
      const date = new Date(tx.timestamp).toLocaleString();
      return {
        Date: date,
        Type: isOutgoing ? 'Outgoing' : 'Incoming',
        Amount: tx.amount,
        Currency: 'USDC',
        From: tx.senderWallet,
        FromName: tx.senderName || '',
        To: tx.recipientWallet,
        ToName: tx.recipientName || '',
        Memo: tx.memo || '',
        Status: tx.status,
        Signature: tx.signature
      };
    });
    
    // Convert to CSV
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(obj => Object.values(obj).map(value => 
      typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
    ).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Wallet Not Connected Message */}
      {!publicKey && (
        <div className="text-center py-16">
          <FaWallet className="text-6xl text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Connect Your Wallet</h1>
          <p className="text-lg text-gray-600 mb-8">
            You need to connect your wallet to view and manage your payees.
          </p>
        </div>
      )}

      {/* Payees and Transaction Management */}
      {publicKey && (
        <>
          {/* Form Overlay */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="max-w-2xl w-full">
                <PayeeForm 
                  payee={payeeToEdit} 
                  onSave={handleFormClose} 
                  onCancel={handleFormClose} 
                />
              </div>
            </div>
          )}

          {/* Payment Form Overlay */}
          {payeeToPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="max-w-md w-full">
                <PaymentForm 
                  payee={payeeToPayment} 
                  onSuccess={handlePaymentClose} 
                  onCancel={handlePaymentClose} 
                />
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Payments Management</h1>
            <div className="flex space-x-4">
              <button
                onClick={handleAddClick}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Payee
              </button>
              <button
                onClick={handleRunPayroll}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
              >
                <FaMoneyBillWave className="mr-2" /> Process Payroll
              </button>
            </div>
          </div>

          {/* Payees Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            {/* Header and Search Bar on same line */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="flex items-center text-gray-800">
                  <FaUsers className="text-primary text-xl mr-2" />
                  <span className="text-xl font-bold">Payees</span>
                </div>
              </div>
              <div className="w-full max-w-xl ml-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                    placeholder="Search payees by name, wallet, or description..."
                    value={payeeSearchTerm}
                    onChange={(e) => setPayeeSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Payees Grid */}
            {filteredPayees.length === 0 && !payeeSearchTerm ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-6 shadow-md flex items-center justify-center">
                    <FaUsers className="text-primary text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No Payees Yet</h3>
                  <p className="text-gray-600 mb-8 px-4">
                    Get started by adding your first payee. You can add employees, contractors, or any other payment recipients.
                  </p>
                  <button
                    onClick={handleAddClick}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center shadow-md hover:shadow-lg transition-all"
                  >
                    <FaPlus className="mr-2" /> Add Your First Payee
                  </button>
                </div>
              </div>
            ) : filteredPayees.length === 0 && payeeSearchTerm ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No payees found matching your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Existing Payee Cards */}
                {filteredPayees.map(payee => (
                  <PayeeCard
                    key={payee.id}
                    payee={payee}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onPay={handlePayClick}
                    onInvoice={handleInvoiceClick}
                  />
                ))}
                
                {/* Add New Payee Card */}
                {!payeeSearchTerm && (
                  <div 
                    onClick={handleAddClick}
                    className="bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="p-3 bg-gray-100 rounded-full mb-3">
                      <FaPlus className="text-primary text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Add New Payee</h3>
                    <p className="text-sm text-gray-500 text-center">
                      Click to add a new person or company to your payees
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transaction History Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center text-gray-800">
                <FaHistory className="text-primary text-xl mr-2" />
                <span className="text-xl font-bold">Transactions</span>
              </div>
              
              {transactions.length > 0 && (
                <button
                  onClick={exportTransactions}
                  className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center shrink-0 text-sm"
                >
                  <FaFileExport className="mr-2" /> Export CSV
                </button>
              )}
            </div>
            
            {/* Search filters */}
            <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
              <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="md:col-span-3 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Search by name, wallet address, or memo..."
                    value={transactionSearchTerm}
                    onChange={(e) => setTransactionSearchTerm(e.target.value)}
                  />
                </div>
                
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg appearance-none bg-white text-sm"
                  >
                    <option value="all">All Transactions</option>
                    <option value="incoming">Incoming Only</option>
                    <option value="outgoing">Outgoing Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction List with scroll */}
            <div className="max-h-[450px] overflow-y-auto border border-gray-100 rounded-lg bg-gray-50">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  {transactions.length === 0 ? (
                    <p className="text-gray-500">You haven&apos;t made any transactions yet.</p>
                  ) : (
                    <p className="text-gray-500">No transactions match your search criteria.</p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredTransactions.map(transaction => (
                    <div key={transaction.id} className="px-2 py-1">
                      <TransactionCard 
                        transaction={transaction} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PayeesPage; 