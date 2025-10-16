import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaArrowLeft, FaPaperPlane, FaSpinner, FaPlus, FaTrash, FaDownload, FaSearch, FaUser } from 'react-icons/fa';
import { formatWalletAddress } from '../utils/solana';
import { usePayees } from '../contexts/PayeesContext';
import { useTaxCalculator } from '../hooks/useTaxCalculator';

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { publicKey } = useWallet();
  
  const { payees } = usePayees();
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [previousClients, setPreviousClients] = useState([]);
  const [showTaxHelper, setShowTaxHelper] = useState(false);
  
  // Use the tax calculator hook
  const {
    country: taxCountry,
    setCountry: setTaxCountry,
    state: taxState,
    setState: setTaxState,
    category: serviceCategory,
    setCategory: setServiceCategory,
    customRate: taxRate,
    setCustomRate: setTaxRate,
    getTaxInfo,
    getStates,
    getCountries
  } = useTaxCalculator();
  
  const [formData, setFormData] = useState({
    // Payee Info (your business - who gets paid)
    payeeName: '',
    payeeWallet: '',
    payeeEmail: '',
    payeePhone: '',
    payeeAddress: '',
    payeeNameChecked: false,
    payeeAddressChecked: false,
    payeeEmailChecked: false,
    payeePhoneChecked: false,
    
    // Bill To Info (client - separate from payee wallet)
    billToName: '',
    billToEmail: '',
    billToPhone: '',
    billToAddress: '',
    billToWallet: '', // Client's wallet address (separate from business wallet)
    billToNameChecked: false,
    billToAddressChecked: false,
    billToEmailChecked: false,
    billToPhoneChecked: false,
    
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
    serviceCategory: 'general',
    taxCountry: 'US',
    
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
    taxAmount: 0,
    discountType: 'none',
    discountValue: 0,
    discountAmount: 0,
    total: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);

  // Calculate amounts when items or tax/discount changes
  useEffect(() => {
    let subtotal = formData.items.reduce((sum, item) => {
      const amount = Number(item.quantity) * Number(item.unitPrice);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const taxAmount = subtotal * (taxRate / 100);
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
  }, [formData.items, taxRate, formData.discountType, formData.discountValue]);

  // Initialize form with client data if available (Bill To information)
  useEffect(() => {
    if (location.state?.payee) {
      const { name, email, phone, address, walletAddress } = location.state.payee;
      setFormData(prev => ({
        ...prev,
        // Set Bill To information (client)
        billToName: name || '',
        billToEmail: email || '',
        billToPhone: phone || '',
        billToAddress: address || '',
        billToWallet: walletAddress || ''
      }));
    }
  }, [location.state]);

  // Load business info from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('businessInfo');
    if (stored) {
      setBusinessInfo(JSON.parse(stored));
    }
  }, []);

  // Fetch previously billed clients from invoices or use payees
  useEffect(() => {
    const fetchPreviousClients = async () => {
      if (!publicKey) return;
      
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/invoices?user_wallet=${publicKey.toString()}`);
        
        if (response.ok) {
          const invoices = await response.json();
          // Extract unique clients from invoices
          const clientsMap = new Map();
          invoices.forEach(invoice => {
            if (invoice.billToName) {
              clientsMap.set(invoice.billToEmail || invoice.billToName, {
                name: invoice.billToName,
                email: invoice.billToEmail || '',
                phone: invoice.billToPhone || '',
                address: invoice.billToAddress || '',
                wallet: invoice.billToWallet || ''
              });
            }
          });
          setPreviousClients(Array.from(clientsMap.values()));
        }
      } catch (err) {
        console.error('Error fetching previous clients:', err);
        // Fallback to payees if API fails
        setPreviousClients(payees.map(p => ({
          name: p.name,
          email: p.email || '',
          phone: p.phone || '',
          address: p.address || '',
          wallet: p.walletAddress || ''
        })));
      }
    };
    
    fetchPreviousClients();
  }, [publicKey, payees]);


  // Auto-calculate due date based on payment terms and issue date
  useEffect(() => {
    if (!formData.issueDate || !formData.terms) return;

    const calculateDueDate = () => {
      const issueDate = new Date(formData.issueDate);
      let dueDate = new Date(issueDate);

      switch (formData.terms) {
        case 'NET_7':
          dueDate.setDate(issueDate.getDate() + 7);
          break;
        case 'NET_15':
          dueDate.setDate(issueDate.getDate() + 15);
          break;
        case 'NET_30':
          dueDate.setDate(issueDate.getDate() + 30);
          break;
        case 'NET_60':
          dueDate.setDate(issueDate.getDate() + 60);
          break;
        case 'DUE_ON_RECEIPT':
          dueDate = new Date(issueDate);
          break;
        default:
          dueDate.setDate(issueDate.getDate() + 15);
      }

      const formattedDueDate = dueDate.toISOString().split('T')[0];
      
      // Only update if the calculated date is different from current
      if (formattedDueDate !== formData.dueDate) {
        setFormData(prev => ({
          ...prev,
          dueDate: formattedDueDate
        }));
      }
    };

    calculateDueDate();
  }, [formData.issueDate, formData.terms]);

  // Select a previous client
  const handleSelectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      billToName: client.name,
      billToEmail: client.email,
      billToPhone: client.phone,
      billToAddress: client.address,
      billToWallet: client.wallet
    }));
    setShowClientPicker(false);
    setClientSearchTerm('');
  };

  // Filter clients based on search
  const filteredClients = previousClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(clientSearchTerm.toLowerCase()))
  );

  // Auto-populate bank information from business info
  const loadBankInfo = () => {
    if (businessInfo) {
      setFormData(prev => ({
        ...prev,
        // Payee info (your business - who gets paid)
        payeeName: businessInfo.name || '',
        payeeEmail: businessInfo.email || '',
        payeePhone: businessInfo.phone || '',
        payeeAddress: `${businessInfo.street || ''}, ${businessInfo.city || ''}, ${businessInfo.state || ''} ${businessInfo.zip || ''}, ${businessInfo.country || ''}`.replace(/^,\s*|,\s*$|,\s*,/g, '').trim(),
        // Bank details
        bankName: businessInfo.bankName || '',
        bankAccount: businessInfo.accountNumber || '',
        bankRouting: businessInfo.routingNumber || '',
        swiftCode: businessInfo.swiftCode || ''
      }));
    }
  };

  // Auto-populate crypto information from business info
  const loadCryptoInfo = () => {
    if (businessInfo) {
      setFormData(prev => ({
        ...prev,
        // Payee info (your business - who gets paid)
        payeeName: businessInfo.name || '',
        payeeEmail: businessInfo.email || '',
        payeePhone: businessInfo.phone || '',
        payeeAddress: `${businessInfo.street || ''}, ${businessInfo.city || ''}, ${businessInfo.state || ''} ${businessInfo.zip || ''}, ${businessInfo.country || ''}`.replace(/^,\s*|,\s*$|,\s*,/g, '').trim(),
        // Crypto details
        payeeWallet: businessInfo.walletAddress || '',
        chainType: businessInfo.chainType || 'solana',
        token: businessInfo.token || ''
      }));
    }
  };

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

      // Get business name from the same source as the invoice data
    const businessInfo = JSON.parse(localStorage.getItem('businessInfo')) || { name: 'Your Business Name' };
    
    const requestData = {
      invoiceData,
      businessName: businessInfo.name,
      templateName: formData.templateName
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
      
      // Store the created invoice information
      setCreatedInvoice({
        id: result.id || result._id || 'undefined',
        invoiceNumber: formData.invoiceNumber,
        clientName: formData.payeeName,
        clientEmail: formData.payeeEmail,
        // Use the viewUrl from the backend response
        url: `${apiUrl}${result.viewUrl}`
      });
      
      setSuccess(true);
      
      // No longer automatically navigate away - let user choose what to do next
      
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
  
  // Function to handle sending invoice via email
  const handleSendEmail = async () => {
    if (!createdInvoice || !createdInvoice.clientEmail) {
      setError('Cannot send email: Missing client email address');
      return;
    }
    
    try {
      setEmailSending(true);
      
      // API call to send the invoice via email
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/invoices/${createdInvoice.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: createdInvoice.clientEmail,
          // The URL is already properly formatted from the backend
          invoiceUrl: createdInvoice.url,
          invoiceNumber: createdInvoice.invoiceNumber
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send invoice email');
      }
      
      setEmailSent(true);
    } catch (err) {
      console.error('Error sending invoice email:', err);
      setError(err.message || 'Failed to send invoice email');
    } finally {
      setEmailSending(false);
    }
  };
  
  // Function to copy invoice URL to clipboard
  const handleCopyUrl = () => {
    if (createdInvoice && createdInvoice.url) {
      navigator.clipboard.writeText(createdInvoice.url)
        .then(() => {
          // Show temporary success message (could use a toast notification here)
          const urlElement = document.getElementById('invoice-url');
          if (urlElement) {
            const originalText = urlElement.textContent;
            urlElement.textContent = 'URL copied!';
            setTimeout(() => {
              urlElement.textContent = originalText;
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
          setError('Failed to copy URL to clipboard');
        });
    }
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
              
              {/* Invoice URL Section */}
              {createdInvoice && createdInvoice.url && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">Invoice URL</h4>
                  <div className="mt-2 flex items-center justify-center">
                    <div className="flex-1 overflow-hidden">
                      <p id="invoice-url" className="text-sm font-mono text-blue-600 truncate">
                        {createdInvoice.url}
                      </p>
                    </div>
                    <button
                      onClick={handleCopyUrl}
                      className="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Copy URL"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Share this URL with your client to view the invoice</p>
                </div>
              )}
              
              {/* Email Section */}
              {createdInvoice && createdInvoice.clientEmail && (
                <div className="mt-4">
                  {!emailSent ? (
                    <button
                      onClick={handleSendEmail}
                      disabled={emailSending}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${emailSending ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {emailSending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Email...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Send Invoice to {createdInvoice.clientEmail}
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md">
                      <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Email Sent Successfully
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/invoices')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  View All Invoices
                </button>
                <button
                  onClick={() => navigate('/invoices/create')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Create Another Invoice
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Payee Section (Your Business - Who Gets Paid) */}
              <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payee (Your Business)</h3>
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
                        placeholder="Your Business Name"
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
                        placeholder="Your Business Address"
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
                        placeholder="your@business.com"
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Wire / ACH Information</h3>
                  {businessInfo && (businessInfo.name || businessInfo.bankName || businessInfo.accountNumber) && (
                    <button
                      type="button"
                      onClick={loadBankInfo}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      <FaDownload className="mr-1" />
                      Load Your Business & Bank Info
                    </button>
                  )}
                </div>
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

              {/* Crypto Information Section */}
              <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Crypto Information</h3>
                  {businessInfo && (businessInfo.name || businessInfo.walletAddress) && (
                    <button
                      type="button"
                      onClick={loadCryptoInfo}
                      className="flex items-center px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                    >
                      <FaDownload className="mr-1" />
                      Load Your Business & Crypto Info
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chain Type</label>
                    <select
                      name="chainType"
                      value={formData.chainType}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                      <option value="">Select Chain</option>
                      <option value="solana">Solana</option>
                      <option value="ethereum">Ethereum</option>
                      <option value="bitcoin">Bitcoin</option>
                      <option value="polygon">Polygon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Token</label>
                    <input
                      type="text"
                      name="token"
                      value={formData.token}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="e.g. USDC, ETH, SOL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
                    <input
                      type="text"
                      name="payeeWallet"
                      value={formData.payeeWallet}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-mono text-sm"
                      placeholder="Wallet address for receiving payments"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Bill To Information (Client) */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Bill To (Client)</h3>
                      {previousClients.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowClientPicker(true)}
                          className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                        >
                          <FaUser className="mr-1" />
                          Select Previous Client
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="billToName" className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          id="billToName"
                          name="billToName"
                          value={formData.billToName}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="Client name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billToEmail" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          id="billToEmail"
                          name="billToEmail"
                          value={formData.billToEmail}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="Client email address"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billToPhone" className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          id="billToPhone"
                          name="billToPhone"
                          value={formData.billToPhone}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="Client phone number"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billToAddress" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                          id="billToAddress"
                          name="billToAddress"
                          rows={3}
                          value={formData.billToAddress}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                          placeholder="Client street address, City, State, ZIP"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="billToWallet" className="block text-sm font-medium text-gray-700">
                          Client Wallet Address <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            id="billToWallet"
                            name="billToWallet"
                            value={formData.billToWallet}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-mono"
                            placeholder="Client's wallet address (if paying via crypto)"
                          />
                        </div>
                        {formData.billToWallet && (
                          <p className="mt-1 text-xs text-gray-500">
                            {formatWalletAddress(formData.billToWallet)}
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
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                          Due Date <span className="text-xs text-gray-400">(Auto-calculated)</span>
                        </label>
                        <input
                          type="date"
                          id="dueDate"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-blue-50"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Automatically set based on payment terms. You can override if needed.
                        </p>
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
                    
                    <div className="mb-4 pb-3 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tax Configuration</span>
                        <button
                          type="button"
                          onClick={() => setShowTaxHelper(!showTaxHelper)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {showTaxHelper ? 'Hide' : 'Show'} Tax Helper
                        </button>
                      </div>
                      
                      {showTaxHelper && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-3 space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Country/Region</label>
                            <select
                              value={taxCountry}
                              onChange={(e) => {
                                setTaxCountry(e.target.value);
                                setTaxState(''); // Reset state when country changes
                              }}
                              className="w-full text-sm border border-gray-300 rounded-md py-1 px-2 focus:ring-primary focus:border-primary"
                            >
                              {getCountries().map(country => (
                                <option key={country.code} value={country.code}>
                                  {country.name} ({country.taxType})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {taxCountry === 'US' ? 'State' : taxCountry === 'CA' ? 'Province' : 'Region'}
                            </label>
                            <select
                              value={taxState}
                              onChange={(e) => setTaxState(e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded-md py-1 px-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="">Select {taxCountry === 'US' ? 'State' : taxCountry === 'CA' ? 'Province' : 'Region'}</option>
                              {Object.entries(getStates(taxCountry)).map(([code, data]) => (
                                <option key={code} value={code}>
                                  {data.name} - {data.rate}%
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Service/Product Category</label>
                            <select
                              value={serviceCategory}
                              onChange={(e) => setServiceCategory(e.target.value)}
                              className="w-full text-sm border border-gray-300 rounded-md py-1 px-2 focus:ring-primary focus:border-primary"
                            >
                              <option value="general">General Services</option>
                              <option value="consulting">Consulting/Professional Services</option>
                              <option value="digital">Digital Products</option>
                              <option value="saas">SaaS/Software</option>
                              <option value="goods">Physical Goods</option>
                            </select>
                          </div>
                          
                          {getTaxInfo().stateName && (
                            <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded space-y-1">
                              <div><strong>Tax Type:</strong> {getTaxInfo().taxType}</div>
                              <div><strong>Region:</strong> {getTaxInfo().stateName}, {getTaxInfo().countryName}</div>
                              <div><strong>Rate:</strong> {getTaxInfo().note}</div>
                              {getTaxInfo().categoryNote && (
                                <div><strong>Category:</strong> {getTaxInfo().categoryNote}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>Tax Rate</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={taxRate}
                            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-primary focus:border-primary"
                          />
                          <span className="text-xs">%</span>
                        </div>
                        <span className="font-medium">${formData.taxAmount.toFixed(2)}</span>
                      </div>
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

      {/* Client Picker Modal */}
      {showClientPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Select Previous Client</h2>
              <button
                onClick={() => {
                  setShowClientPicker(false);
                  setClientSearchTerm('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Search by name or email..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Client List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredClients.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {filteredClients.map((client, index) => (
                      <li
                        key={index}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSelectClient(client)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{client.name}</p>
                            {client.email && (
                              <p className="text-sm text-gray-500 mt-1">{client.email}</p>
                            )}
                            {client.phone && (
                              <p className="text-sm text-gray-500">{client.phone}</p>
                            )}
                            {client.address && (
                              <p className="text-sm text-gray-400 mt-1">{client.address}</p>
                            )}
                            {client.wallet && (
                              <p className="text-xs text-gray-400 font-mono mt-1">
                                {formatWalletAddress(client.wallet)}
                              </p>
                            )}
                          </div>
                          <FaUser className="text-primary ml-4 flex-shrink-0" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {clientSearchTerm ? (
                      <p>No clients found matching &quot;{clientSearchTerm}&quot;</p>
                    ) : (
                      <p>No previous clients found</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowClientPicker(false);
                  setClientSearchTerm('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceCreatePage;
