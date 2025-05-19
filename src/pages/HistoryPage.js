import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTransactions } from '../contexts/TransactionsContext';
import TransactionCard from '../components/TransactionCard';
import { FaWallet, FaSearch, FaFileExport } from 'react-icons/fa';

const HistoryPage = () => {
  const { publicKey } = useWallet();
  const { transactions } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'incoming', 'outgoing'
  
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
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (transaction.recipientName && transaction.recipientName.toLowerCase().includes(searchTermLower)) ||
      (transaction.senderName && transaction.senderName.toLowerCase().includes(searchTermLower)) ||
      transaction.recipientWallet.toLowerCase().includes(searchTermLower) ||
      transaction.senderWallet.toLowerCase().includes(searchTermLower) ||
      (transaction.memo && transaction.memo.toLowerCase().includes(searchTermLower))
    );
  });

  const exportTransactions = () => {
    // Format transactions for CSV export
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
            You need to connect your wallet to view transaction history.
          </p>
        </div>
      )}

      {/* Transaction History */}
      {publicKey && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-3 sm:mb-0">Transaction History</h1>
            
            {transactions.length > 0 && (
              <button
                onClick={exportTransactions}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
              >
                <FaFileExport className="mr-2" /> Export CSV
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                placeholder="Search by name, wallet address, or memo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="mt-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg appearance-none bg-white"
              >
                <option value="all">All Transactions</option>
                <option value="incoming">Incoming Only</option>
                <option value="outgoing">Outgoing Only</option>
              </select>
            </div>
          </div>
          
          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              {transactions.length === 0 ? (
                <p className="text-gray-500">You haven't made any transactions yet.</p>
              ) : (
                <p className="text-gray-500">No transactions match your search criteria.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map(transaction => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage; 