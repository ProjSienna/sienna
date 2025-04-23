import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePayees } from '../contexts/PayeesContext';
import PayeeCard from '../components/PayeeCard';
import PayeeForm from '../components/PayeeForm';
import PaymentForm from '../components/PaymentForm';
import { FaPlus, FaSearch, FaWallet } from 'react-icons/fa';

const PayeesPage = () => {
  const { publicKey } = useWallet();
  const { payees, deletePayee } = usePayees();
  const [showAddForm, setShowAddForm] = useState(false);
  const [payeeToEdit, setPayeeToEdit] = useState(null);
  const [payeeToPayment, setPayeeToPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter payees by search term
  const filteredPayees = payees.filter(payee => 
    payee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payee.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payee.description && payee.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const handleFormClose = () => {
    setShowAddForm(false);
    setPayeeToEdit(null);
  };

  const handlePaymentClose = () => {
    setPayeeToPayment(null);
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

      {/* Payees Management */}
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
            <h1 className="text-3xl font-bold text-gray-800">Manage Payees</h1>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
            >
              <FaPlus className="mr-2" /> Add New Payee
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg"
                placeholder="Search payees by name, wallet, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Payees Grid */}
          {filteredPayees.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              {searchTerm ? (
                <p className="text-gray-500">No payees found matching your search criteria.</p>
              ) : (
                <>
                  <p className="text-gray-500 mb-4">You haven't added any payees yet.</p>
                  <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 inline-flex items-center"
                  >
                    <FaPlus className="mr-2" /> Add Your First Payee
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPayees.map(payee => (
                <PayeeCard 
                  key={payee.id} 
                  payee={payee} 
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onPay={handlePayClick}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayeesPage; 