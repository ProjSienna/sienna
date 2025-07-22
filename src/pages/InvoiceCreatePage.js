import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaArrowLeft, FaPaperPlane, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey } = useWallet();
  
  const [formData, setFormData] = useState({
    // Payee Info
    payeeName: '',
    payeeWallet: '',
    payeeEmail: '',
    payeePhone: '',
    payeeAddress: '',
    payeeNameChecked: false,
    payeeAddressChecked: false,
    payeeEmailChecked: false,
    payeePhoneChecked: false,
    
    // Wire/ACH Info
    bankType: 'wire', // 'wire' or 'ach'
    bankName: '',
    bankAccount: '',
    bankRouting: '',
    bankNameChecked: false,
    bankAccountChecked: false,
    bankRoutingChecked: false,
    swiftCode: '', // for wire
    // Crypto Info
    chainType: '', // e.g. Ethereum, Solana
    token: '', // e.g. USDC, ETH

    
    // Invoice Details
    invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    terms: 'NET_15',
    status: 'DRAFT',
    notes: '',
    
    // Line Items
    items: [{
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }],
    
    // Summary
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discountType: 'none',
    discountValue: 0,
    discountAmount: 0,
    total: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Calculate amounts when items or tax/discount changes
  useEffect(() => {
    let subtotal = formData.items.reduce((sum, item) => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const taxAmount = subtotal * (formData.taxRate / 100);
    let discountAmount = 0;
    
    if (formData.discountType === 'percentage' && formData.discountValue > 0) {
      discountAmount = subtotal * (formData.discountValue / 100);
    } else if (formData.discountType === 'fixed' && formData.discountValue > 0) {
      discountAmount = formData.discountValue;
    }

    const total = subtotal + taxAmount - discountAmount;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      discountAmount,
      total
    }));
  }, [formData.items, formData.taxRate, formData.discountType, formData.discountValue]);

  // Initialize form with payee data if available
  useEffect(() => {
    if (location.state?.payee) {
      const { name, walletAddress, email, phone, address } = location.state.payee;
      setFormData(prev => ({
        ...prev,
        payeeName: name || '',
        payeeWallet: walletAddress || '',
        payeeEmail: email || '',
        payeePhone: phone || '',
        payeeAddress: address || ''
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (id, field, value) => {
    const updatedItems = formData.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    });
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now() + prev.items.length,
          description: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0
        }
      ]
    }));
  };

  const removeLineItem = (id) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.payeeWallet) {
      setError('Payee wallet address is required');
      return;
    }
    
    if (formData.items.some(item => !item.description || item.amount <= 0)) {
      setError('Please fill in all line items with valid amounts');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');

      // Prepare the invoice data according to the API structure
      const invoiceData = {
        invoice_info: {
          invoice_number: formData.invoiceNumber,
          issue_date: formData.issueDate,
          due_date: formData.dueDate,
          currency: "USD",
          tax_rate: parseFloat(formData.taxRate) / 100,
          payment_terms: formData.terms.replace('_', ' '),
        },
        business_info: (() => {
          const businessInfo = JSON.parse(localStorage.getItem('businessInfo')) || {
            name: 'Your Business Name',
            email: 'your-email@example.com',
            phone: '+1 (555) 000-0000',
            street: 'Your Business Address',
            city: 'City',
            state: 'State',
            zip: '00000',
            country: 'Country'
          };
          return {
            name: businessInfo.name,
            contact: {
              email: businessInfo.email,
              phone: businessInfo.phone
            },
            address: {
              street: businessInfo.street,
              city: businessInfo.city,
              state: businessInfo.state,
              zip: businessInfo.zip,
              country: businessInfo.country
            }
          };
        })(),
        client_info: {
          name: formData.payeeName,
          contact: {
            name: formData.payeeName,
            email: formData.payeeEmail,
            phone: formData.payeePhone
          },
          address: {
            street: formData.payeeAddress.split('\n')[0] || '',
            city: formData.payeeAddress.split('\n')[1]?.split(',')[0]?.trim() || '',
            state: formData.payeeAddress.split(', ')[1]?.split(' ')[0] || '',
            zip: formData.payeeAddress.match(/\d{5}(-\d{4})?/)?.[0] || '',
            country: "USA"
          }
        },
        line_items: formData.items.map(item => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unitPrice),
          amount: parseFloat(item.amount)
        })),
        summary: {
          subtotal: formData.subtotal,
          tax_amount: formData.taxAmount,
          total_due: formData.total
        },
        notes: formData.notes,
        footer: "Thank you for your business!",
        payment_info: {
          bank: {
            bank_name: formData.bankName,
            account_number: formData.bankAccount,
            routing_number: formData.bankRouting,
            swift_code: formData.bankType === 'wire' ? formData.swiftCode : '',
            account_holder: formData.payeeName
          },
          crypto: {
            wallet_address: formData.payeeWallet,
            chain_type: formData.chainType || '',
            token: formData.token || ''
          }
        }
      };

      const requestData = {
        invoiceData,
        businessName: formData.businessInfo.name,
        templateName: formData.templateName || "default_invoice"
      };

      // Make the API call
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }

      const result = await response.json();
      console.log('Invoice created:', result);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/invoices');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // If wallet is not connected, show message
  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please connect your wallet to create an invoice.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={handleBack}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back
      </button>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Invoice</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {success ? (
            <div className="text-center py-10">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Invoice Created!</h3>
              <p className="mt-2 text-sm text-gray-500">Your invoice has been successfully created.</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/invoices')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  View All Invoices
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Payment Recipient Section */}
              <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Recipient</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="payeeName"
                        value={formData.payeeName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="BeneficaryABC"
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={formData.payeeNameChecked}
                        onChange={e => setFormData(prev => ({ ...prev, payeeNameChecked: e.target.checked }))}
                        title="Verified"
                      />
                      <span className="ml-1 text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="payeeAddress"
                        value={formData.payeeAddress}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="100 East 1st Street New York, NY 10009"
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={formData.payeeAddressChecked}
                        onChange={e => setFormData(prev => ({ ...prev, payeeAddressChecked: e.target.checked }))}
                        title="Verified"
                      />
                      <span className="ml-1 text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="flex items-center">
                      <input
                        type="email"
                        name="payeeEmail"
                        value={formData.payeeEmail}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="info@beneficaryabc.com"
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={formData.payeeEmailChecked}
                        onChange={e => setFormData(prev => ({ ...prev, payeeEmailChecked: e.target.checked }))}
                        title="Verified"
                      />
                      <span className="ml-1 text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <div className="flex items-center">
                      <input
                        type="tel"
                        name="payeePhone"
                        value={formData.payeePhone}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="555-555-5555"
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={formData.payeePhoneChecked}
                        onChange={e => setFormData(prev => ({ ...prev, payeePhoneChecked: e.target.checked }))}
                        title="Verified"
                      />
                      <span className="ml-1 text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wire/ACH Information Section */}
              <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Wire / ACH Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      name="bankType"
                      value={formData.bankType}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="wire">Wire</option>
                      <option value="ach">ACH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Bank Name"
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={formData.bankNameChecked}
                        onChange={e => setFormData(prev => ({ ...prev, bankNameChecked: e.target.checked }))}
                        title="Verified"
                      />
                      <span className="ml-1 text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Account Number"
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={formData.bankAccountChecked}
                        onChange={e => setFormData(prev => ({ ...prev, bankAccountChecked: e.target.checked }))}
                        title="Verified"
                      />
                      <span className="ml-1 text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        name="bankRouting"
                        value={formData.bankRouting}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Routing Number"
                      />
                      <input
                        type="checkbox"
                        className="ml-2"
                        checked={formData.bankRoutingChecked}
                        onChange={e => setFormData(prev => ({ ...prev, bankRoutingChecked: e.target.checked }))}
                        title="Verified"
                      />
                      <span className="ml-1 text-xs text-gray-500">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Payee Information (legacy, keep for reference or remove if not needed) */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Bill To</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="payeeName" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          id="payeeName"
                          name="payeeName"
                          value={formData.payeeName}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="Payee name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="payeeEmail" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          id="payeeEmail"
                          name="payeeEmail"
                          value={formData.payeeEmail}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="email@example.com"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="payeePhone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          id="payeePhone"
                          name="payeePhone"
                          value={formData.payeePhone}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="(123) 456-7890"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="payeeAddress" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                          id="payeeAddress"
                          name="payeeAddress"
                          rows={3}
                          value={formData.payeeAddress}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="Street address, City, State, ZIP"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="payeeWallet" className="block text-sm font-medium text-gray-700">Wallet Address</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="payeeWallet"
                            name="payeeWallet"
                            value={formData.payeeWallet}
                            onChange={handleChange}
                            className="block w-full pr-10 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            placeholder="Wallet address"
                            required
                          />
                        </div>
                        {formData.payeeWallet && (
                          <p className="mt-1 text-xs text-gray-500">
                            {formatWalletAddress(formData.payeeWallet)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Invoice Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700">Invoice #</label>
                        <input
                          type="text"
                          id="invoiceNumber"
                          name="invoiceNumber"
                          value={formData.invoiceNumber}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-gray-50"
                          disabled
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="SENT">Sent</option>
                          <option value="PAID">Paid</option>
                          <option value="OVERDUE">Overdue</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">Issue Date</label>
                        <input
                          type="date"
                          id="issueDate"
                          name="issueDate"
                          value={formData.issueDate}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input
                          type="date"
                          id="dueDate"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="terms" className="block text-sm font-medium text-gray-700">Payment Terms</label>
                        <select
                          id="terms"
                          name="terms"
                          value={formData.terms}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                          <option value="NET_7">Net 7</option>
                          <option value="NET_15">Net 15</option>
                          <option value="NET_30">Net 30</option>
                          <option value="NET_60">Net 60</option>
                          <option value="DUE_ON_RECEIPT">Due on Receipt</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Line Items */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Items</h3>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <FaPlus className="mr-1 h-3 w-3" /> Add Item
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items.map((item, index) => (
                        <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                              className="block w-full border-0 border-b border-transparent focus:border-primary focus:ring-0 sm:text-sm"
                              placeholder="Description"
                              required
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                              className="block w-20 text-right border-0 border-b border-transparent focus:border-primary focus:ring-0 sm:text-sm"
                              required
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                                className="focus:ring-primary focus:border-primary block w-full pl-7 pr-2 sm:text-sm border-0 border-b border-transparent focus:border-primary"
                                required
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            ${item.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLineItem(item.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary focus:border-primary mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Any additional notes or terms"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Subtotal</span>
                      <span>${formData.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <div>
                        <span>Tax</span>
                        <select
                          value={formData.taxRate}
                          onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) }))}
                          className="ml-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-primary text-sm p-0"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="10">10%</option>
                          <option value="15">15%</option>
                          <option value="20">20%</option>
                        </select>
                      </div>
                      <span>${formData.taxAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <div>
                        <span>Discount</span>
                        <select
                          value={formData.discountType}
                          onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                          className="ml-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-primary text-sm p-0"
                        >
                          <option value="none">None</option>
                          <option value="percentage">%</option>
                          <option value="fixed">$</option>
                        </select>
                        {formData.discountType !== 'none' && (
                          <input
                            type="number"
                            min="0"
                            step={formData.discountType === 'percentage' ? '1' : '0.01'}
                            value={formData.discountValue}
                            onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                            className="w-16 ml-2 border-0 border-b border-gray-300 focus:ring-0 focus:border-primary text-sm p-0"
                          />
                        )}
                      </div>
                      <span>-${formData.discountAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-medium">
                      <span>Total</span>
                      <span>${formData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="-ml-1 mr-2 h-4 w-4" />
                      Create Invoice
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;
