import React, { useState, useEffect } from 'react';
import { usePayees } from '../contexts/PayeesContext';

const PayeeForm = ({ payee = null, onSave, onCancel }) => {
  const { addPayee, updatePayee } = usePayees();
  const [form, setForm] = useState({
    name: '',
    walletAddress: '',
    email: '',
    description: '',
    category: 'regular',
    paymentFrequency: 'monthly',
    amount: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (payee) {
      setForm({
        name: payee.name || '',
        walletAddress: payee.walletAddress || '',
        email: payee.email || '',
        description: payee.description || '',
        category: payee.category || 'regular',
        paymentFrequency: payee.paymentFrequency || 'monthly',
        amount: payee.amount || '',
        notes: payee.notes || '',
      });
    }
  }, [payee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!form.walletAddress.trim()) {
      newErrors.walletAddress = 'Wallet address is required';
    } else if (!/^[A-HJ-NP-Za-km-z1-9]{32,44}$/.test(form.walletAddress)) {
      newErrors.walletAddress = 'Invalid Solana wallet address';
    }
    
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (form.amount && isNaN(Number(form.amount))) {
      newErrors.amount = 'Amount must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const formattedPayee = {
      ...form,
      amount: form.amount ? Number(form.amount) : null,
    };
    
    if (payee) {
      updatePayee(payee.id, formattedPayee);
    } else {
      addPayee(formattedPayee);
    }
    
    onSave?.(formattedPayee);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">
        {payee ? 'Edit Payee' : 'Add New Payee'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">
              Name*
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter payee name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          {/* Wallet Address */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="walletAddress">
              Wallet Address*
            </label>
            <input
              type="text"
              id="walletAddress"
              name="walletAddress"
              value={form.walletAddress}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${errors.walletAddress ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter Solana wallet address"
            />
            {errors.walletAddress && <p className="text-red-500 text-xs mt-1">{errors.walletAddress}</p>}
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter email address (optional)"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          {/* Category */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="regular">Regular Employee</option>
              <option value="contractor">Contractor</option>
              <option value="vendor">Vendor</option>
              <option value="friend">Friend</option>
              <option value="family">Family</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          {/* Payment Frequency */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="paymentFrequency">
              Payment Frequency
            </label>
            <select
              id="paymentFrequency"
              name="paymentFrequency"
              value={form.paymentFrequency}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="once">One-time</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
          </div>
          
          {/* Amount */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="amount">
              Default Amount (USDC)
            </label>
            <input
              type="text"
              id="amount"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter default payment amount"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Brief description of payee"
          />
        </div>
        
        {/* Notes */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-lg"
            placeholder="Additional notes about this payee"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            {payee ? 'Update Payee' : 'Add Payee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PayeeForm; 