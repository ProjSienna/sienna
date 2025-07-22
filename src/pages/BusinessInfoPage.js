import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaBuilding, FaArrowLeft } from 'react-icons/fa';
import BusinessInfoForm from '../components/BusinessInfoForm';

const BusinessInfoPage = () => {
  const { publicKey } = useWallet();
  const navigate = useNavigate();

  // If user is not authenticated, redirect to landing page
  if (!publicKey) {
    return <Navigate to="/landing" />;
  }

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
        
        <div className="flex items-center">
          <div className="bg-blue-100 p-3 rounded-md mr-4">
            <FaBuilding className="text-3xl text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Business Information</h1>
            <p className="text-gray-600">Manage your business details for invoices and payments</p>
          </div>
        </div>
      </div>

      {/* Business Info Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Business Details</h2>
          <p className="text-gray-600">
            This information will be automatically included in all your invoices. 
            Make sure to keep it up to date.
          </p>
        </div>
        
        <BusinessInfoForm />
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-blue-700">
              Your business information will be automatically populated when creating new invoices. 
              This saves you time and ensures consistency across all your invoices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessInfoPage;
