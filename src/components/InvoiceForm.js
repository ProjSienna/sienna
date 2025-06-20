import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaFileInvoiceDollar, FaSpinner, FaCheck, FaExclamationTriangle, FaPlus, FaTrash } from 'react-icons/fa';

const InvoiceForm = () => {
  const { publicKey } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    businessInfo: {
      name: '',
      email: '',
      address: '',
      taxId: '',
    },
    clientInfo: {
      name: '',
      email: '',
      address: '',
    },
    invoiceNumber: '',
    issueDate: '',
    dueDate: '',
    items: [
      { description: '', quantity: 1, rate: '', amount: 0 }
    ],
    notes: '',
    terms: ''
  });

  // Calculate total amount
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.amount) || 0);
    }, 0).toFixed(2);
  };

  // Handle form field changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Calculate amount if quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const rate = parseFloat(updatedItems[index].rate) || 0;
      updatedItems[index].amount = (quantity * rate).toFixed(2);
    }
    
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  // Add new item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: '', amount: 0 }]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  };

  // Set default dates and invoice number on mount
  useEffect(() => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 30); // 30 days from now
    
    setFormData(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0]
    }));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      // Basic validation
      if (!formData.businessInfo.name || !formData.clientInfo.name || !formData.clientInfo.email) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.items.length === 0 || !formData.items[0].description) {
        throw new Error('Please add at least one invoice item');
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock success response
      const invoiceData = {
        ...formData,
        total: calculateTotal(),
        status: 'sent',
        createdAt: new Date().toISOString()
      };

      console.log('Invoice created:', invoiceData);

      setSubmitStatus({
        type: 'success',
        message: `Invoice ${formData.invoiceNumber} has been created successfully!`
      });

      // Reset form after success
      setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
        setFormData({
          businessInfo: { name: '', email: '', address: '', taxId: '' },
          clientInfo: { name: '', email: '', address: '' },
          invoiceNumber: generateInvoiceNumber(),
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{ description: '', quantity: 1, rate: '', amount: 0 }],
          notes: '',
          terms: ''
        });
      }, 3000);

    } catch (error) {
      console.error('Error creating invoice:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to create invoice'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Status Messages */}
      {submitStatus.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          submitStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {submitStatus.type === 'success' ? (
            <FaCheck className="mr-2" />
          ) : (
            <FaExclamationTriangle className="mr-2" />
          )}
          {submitStatus.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Invoice Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invoice Number *
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>
          </div>
        </div>

        {/* Business & Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Business Information */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">From (Your Business)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessInfo.name}
                  onChange={(e) => handleInputChange('businessInfo', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.businessInfo.email}
                  onChange={(e) => handleInputChange('businessInfo', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.businessInfo.address}
                  onChange={(e) => handleInputChange('businessInfo', 'address', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID
                </label>
                <input
                  type="text"
                  value={formData.businessInfo.taxId}
                  onChange={(e) => handleInputChange('businessInfo', 'taxId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">To (Client)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  value={formData.clientInfo.name}
                  onChange={(e) => handleInputChange('clientInfo', 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Email *
                </label>
                <input
                  type="email"
                  value={formData.clientInfo.email}
                  onChange={(e) => handleInputChange('clientInfo', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Address
                </label>
                <textarea
                  value={formData.clientInfo.address}
                  onChange={(e) => handleInputChange('clientInfo', 'address', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center px-3 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-lg">
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Item description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Qty"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Rate"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="col-span-2">
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
                    ${item.amount}
                  </div>
                </div>
                <div className="col-span-1">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-primary bg-opacity-10 rounded-lg">
            <div className="flex justify-end">
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-800">
                  Total: ${calculateTotal()} USDC
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Additional notes for the client..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Payment terms and conditions..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating Invoice...
              </>
            ) : (
              <>
                <FaFileInvoiceDollar className="mr-2" />
                Create Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm; 