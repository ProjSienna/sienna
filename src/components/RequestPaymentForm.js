import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePayees } from '../contexts/PayeesContext';
import { FaTimes, FaCopy, FaCheck, FaSearch, FaPlusCircle, FaArrowRight, FaEnvelope, FaChevronLeft } from 'react-icons/fa';

const RequestPaymentForm = ({ onClose }) => {
  const { publicKey } = useWallet();
  const { payees } = usePayees();
  const modalRef = useRef(null);
  
  // Multi-step form states
  const [step, setStep] = useState(1);
  
  // Recipient selection states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayee, setSelectedPayee] = useState(null);
  const [filteredPayees, setFilteredPayees] = useState([]);
  const [isNewRecipient, setIsNewRecipient] = useState(false);
  
  // New recipient information
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    email: '',
    relationship: 'business',
  });
  
  // Payment request details
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // Scroll to top when step changes
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [step]);

  // Filter payees based on search term
  useEffect(() => {
    if (payees && searchTerm) {
      const filtered = payees.filter(
        payee => 
          payee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payee.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPayees(filtered);
    } else {
      setFilteredPayees(payees || []);
    }
  }, [searchTerm, payees]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectPayee = (payee) => {
    setSelectedPayee(payee);
    setIsNewRecipient(false);
    setStep(2);
  };

  const handleNewRecipient = () => {
    setSelectedPayee(null);
    setIsNewRecipient(true);
    setStep(2);
  };

  const handleNewRecipientChange = (e) => {
    const { name, value } = e.target;
    setNewRecipient({
      ...newRecipient,
      [name]: value
    });
  };

  const handleGoBack = () => {
    if (step === 2) {
      setSelectedPayee(null);
      setIsNewRecipient(false);
    }
    setStep(step - 1);
  };

  const handleSubmitDetails = (e) => {
    e.preventDefault();
    setStep(3);
    
    // Generate request data
    const recipient = selectedPayee || newRecipient;
    const requestData = {
      sender: {
        wallet: publicKey.toString()
      },
      recipient: {
        name: recipient.name,
        email: recipient.email,
        wallet: selectedPayee?.walletAddress || ''
      },
      request: {
        amount,
        description,
        dueDate,
        relationship: selectedPayee?.category || newRecipient.relationship,
        timestamp: new Date().toISOString(),
      }
    };

    // In a real implementation, this would be a call to your backend to create a payment request
    // For now, we'll create a mock payment link
    const baseUrl = window.location.origin;
    const paymentLinkUrl = `${baseUrl}/pay?data=${encodeURIComponent(JSON.stringify(requestData))}`;
    setPaymentLink(paymentLinkUrl);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    // In a real implementation, this would call an API to send the email
    // For now, we'll just simulate it
    setEmailSent(true);
  };

  // Render different steps of the form
  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search for a payee
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input 
            type="text"
            className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Search by name, email, or wallet address"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="max-h-48 md:max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredPayees.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredPayees.map(payee => (
              <li 
                key={payee.id} 
                className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                onClick={() => handleSelectPayee(payee)}
              >
                <div className="overflow-hidden">
                  <p className="font-medium text-gray-800 truncate">{payee.name}</p>
                  <p className="text-sm text-gray-500 truncate">{payee.email}</p>
                </div>
                <FaArrowRight className="text-primary flex-shrink-0 ml-2" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No payees found matching your search" : "No payees available"}
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="w-full py-3 border border-dashed border-gray-300 rounded-lg text-primary hover:bg-gray-50 flex items-center justify-center"
          onClick={handleNewRecipient}
        >
          <FaPlusCircle className="mr-2" />
          New Recipient
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Mobile-friendly back button at top */}
      <button
        type="button"
        onClick={handleGoBack}
        className="inline-flex items-center text-sm text-primary hover:text-primary/90 mb-3"
      >
        <FaChevronLeft className="mr-1" /> Back to search
      </button>
      
      {isNewRecipient ? (
        // New recipient form
        <div className="space-y-4 border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-800">New Recipient Details</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name*
            </label>
            <input
              type="text"
              name="name"
              value={newRecipient.name}
              onChange={handleNewRecipientChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Recipient's name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={newRecipient.email}
              onChange={handleNewRecipientChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Recipient's email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              name="relationship"
              value={newRecipient.relationship}
              onChange={handleNewRecipientChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="business">Business</option>
              <option value="client">Client</option>
              <option value="contractor">Contractor</option>
              <option value="friend">Friend</option>
              <option value="family">Family</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      ) : (
        // Selected payee details
        <div className="space-y-4 border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-800">Recipient</h3>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-800">{selectedPayee?.name}</p>
            {selectedPayee?.email && <p className="text-sm text-gray-500">{selectedPayee.email}</p>}
            <p className="text-xs text-gray-400 mt-1 font-mono break-all">{selectedPayee?.walletAddress}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitDetails}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USDC)*
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                if (e.target.value === '' || /^\d*\.?\d{0,6}$/.test(e.target.value)) {
                  setAmount(e.target.value);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="What is this payment for?"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <p className="text-sm text-gray-600">Payment request created successfully!</p>
          {!emailSent && (
            <button
              onClick={handleSendEmail}
              className="flex items-center text-primary hover:text-primary/90 text-sm"
            >
              <FaEnvelope className="mr-1" />
              Send Email
            </button>
          )}
        </div>
        
        {emailSent && (
          <div className="mb-4 bg-green-50 text-green-700 p-2 rounded-lg text-sm flex items-center">
            <FaCheck className="mr-1 flex-shrink-0" />
            <span className="break-words">Email sent to {selectedPayee?.email || newRecipient.email}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={paymentLink}
            readOnly
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono truncate"
          />
          <button
            onClick={handleCopyLink}
            className="shrink-0 p-3 text-primary hover:text-primary/90 transition-colors"
            title="Copy link"
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-gray-600">Payment request details:</p>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div className="border-b border-gray-200 pb-2">
            <p className="text-sm text-gray-500">To</p>
            <p className="font-medium break-words">{selectedPayee?.name || newRecipient.name}</p>
            <p className="text-sm text-gray-600 break-words">{selectedPayee?.email || newRecipient.email}</p>
          </div>
          
          <p className="text-sm">
            <span className="font-medium">Amount:</span> {amount} USDC
          </p>
          <p className="text-sm break-words">
            <span className="font-medium">Description:</span> {description}
          </p>
          {dueDate && (
            <p className="text-sm">
              <span className="font-medium">Due Date:</span> {new Date(dueDate).toLocaleDateString()}
            </p>
          )}
          
          <p className="text-xs text-gray-500 mt-2">
            Requested on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => {
            setStep(1);
            setSelectedPayee(null);
            setIsNewRecipient(false);
            setAmount('');
            setDescription('');
            setDueDate('');
            setPaymentLink('');
            setEmailSent(false);
          }}
          className="py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Create New Request
        </button>
        <button
          onClick={onClose}
          className="py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-lg w-full max-w-lg my-8 relative overflow-hidden"
      >
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Request Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>
    </div>
  );
};

export default RequestPaymentForm; 