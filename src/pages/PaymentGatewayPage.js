import React from 'react';
import PaymentGatewayGuide from '../components/PaymentGatewayGuide';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const PaymentGatewayPage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-primary hover:text-primary-dark"
        >
          <FaArrowLeft className="mr-2" /> Back to home
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <PaymentGatewayGuide onClose={() => {}} />
      </div>
    </div>
  );
};

export default PaymentGatewayPage; 