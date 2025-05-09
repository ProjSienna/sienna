import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { usePayees } from '../contexts/PayeesContext';
import { FaTimes, FaCopy, FaCheck, FaSearch, FaPlusCircle, FaArrowRight, FaEnvelope, FaChevronLeft } from 'react-icons/fa';
import Confetti from 'react-confetti';
import CryptoJS from 'crypto-js'; // We'll use this for encryption
import { Link } from 'react-router-dom';

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
  const [isnewRequestRecipient, setIsnewRequestRecipient] = useState(false);
  
  // New recipient information
  const [newRequestRecipient, setNewRequestRecipient] = useState({
    name: '',
    email: '',
    relationship: 'business',
    walletAddress: '',
  });
  
  // Payment request details
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [addingPayee, setAddingPayee] = useState(false);
  const [payeeError, setPayeeError] = useState(null);
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [senderName, setSenderName] = useState('');

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
          payee.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
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
    setIsnewRequestRecipient(false);
    setStep(2);
  };

  const handlenewRequestRecipient = () => {
    setSelectedPayee(null);
    setIsnewRequestRecipient(true);
    setStep(2);
  };

  const handlenewRequestRecipientChange = (e) => {
    const { name, value } = e.target;
    setNewRequestRecipient({
      ...newRequestRecipient,
      [name]: value
    });
    // Clear any error when user makes changes
    if (payeeError) {
      setPayeeError(null);
    }
  };

  const handleGoBack = () => {
    if (step === 2) {
      setSelectedPayee(null);
      setIsnewRequestRecipient(false);
    }
    setStep(step - 1);
  };

  // Function to encrypt the payment ID
  const encryptPaymentId = (id) => {
    // Use a simple encryption to make it harder to guess/manipulate
    // In production, you'd want to use a secure key from environment variables
    const secretKey = 'sienna-payment-secret-key';
    return CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
  };

  // Function to create a transaction record in the database
  const createTransactionRecord = async () => {
    if (!publicKey) return null;
    
    try {
      setCreatingTransaction(true);
      setTransactionError(null);
      
      const recipient = selectedPayee || newRequestRecipient;
      
      if (!recipient.email) {
        throw new Error("Recipient email is required");
      }
      
      // Format request body to match the API example
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          recipient_wallet: recipient.walletAddress || '',
          recipient_name: recipient.name,
          recipient_email: recipient.email,
          sender_wallet: publicKey.toString(),
          memo: description,
          status: 'requested' // Set status to requested
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create transaction record');
      }

      // Get the payment ID from the response
      const transactionData = await response.json();
      console.log('Transaction record created:', transactionData);
      
      // Return the exact ID as shown in the example
      return transactionData.id; 
    } catch (error) {
      console.error('Error creating transaction record:', error);
      setTransactionError(error.message || 'Failed to create transaction record');
      return null;
    } finally {
      setCreatingTransaction(false);
    }
  };

  // Function to add a contact to the database
  const addContactToDb = async (recipient) => {
    if (!publicKey) return true; // Return success if no wallet connected
    
    // If the recipient doesn't have a wallet or email, don't try to add them
    if (!recipient.walletAddress && !recipient.email) {
      console.log('No wallet or email provided, skipping contact creation');
      return true;
    }
    
    try {
      setAddingPayee(true);
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/user-contacts/user/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: recipient.name,
          email: recipient.email || '',
          wallet_address: recipient.walletAddress || '',
          user_wallet: publicKey.toString()
        }),
      });

      // Consider anything in the 2xx range a success
      if (response.status >= 200 && response.status < 300) {
        console.log('Successfully added contact to database');
        return true;
      }
      
      // For 4xx client errors, the contact might already exist
      if (response.status >= 400 && response.status < 500) {
        console.log('Contact may already exist or have validation issues');
        return true; // Still consider this a success to avoid disrupting the flow
      }

      // Only throw for server errors (5xx)
      if (response.status >= 500) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Server error when adding contact');
      }

      return true;
    } catch (error) {
      console.error('Error adding contact to database:', error);
      // Don't set the error state to avoid showing the error message to the user
      // setPayeeError(error.message || 'Failed to add contact to database');
      return true; // Return true anyway to not block the payment request flow
    } finally {
      setAddingPayee(false);
    }
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    
    // Create a transaction record and get payment ID
    const paymentIdFromAPI = '';//await createTransactionRecord();
    setPaymentId(paymentIdFromAPI);
    
    // If we couldn't create a transaction record, show error but continue
    if (!paymentIdFromAPI) {
      console.warn('Could not create transaction record. Continuing without payment ID.');
    }
    
    // Generate a payment link that points to the pay-request page
    const baseUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
    const recipient = selectedPayee || newRequestRecipient;
    
    // Add the contact to DB using the new API endpoint
    addContactToDb(recipient);
    
    // Generate payment link with the raw payment ID as requested
    let generatedLink;
    if (paymentIdFromAPI) {
      // Use the payment ID directly in the URL
      generatedLink = `${baseUrl}/pay-request?id=${paymentIdFromAPI}`;
    } else {
      // Fallback link without payment ID
      generatedLink = `${baseUrl}/pay-request?amount=${amount}&recipient=${encodeURIComponent(recipient.email)}${recipient.walletAddress ? '&wallet=' + encodeURIComponent(recipient.walletAddress) : ''}`;
    }
    
    setPaymentLink(generatedLink);
    setStep(3);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    try {
      if (!paymentLink) {
        throw new Error('Payment link is not available');
      }

      console.log('paymentLink', paymentLink);
      setSendingEmail(true);
      setEmailError(null);

      // Get the recipient details
      const recipient = selectedPayee || newRequestRecipient;
      
      // Format the email data according to the API requirements
      const emailData = {
        email: recipient.email,
        name: recipient.name,
        recipientWallet: recipient.walletAddress || '',
        amount: amount,
        relationship: recipient.category || recipient.relationship || 'colleague',
        context: description || 'Payment request',
        senderName: senderName || 'A colleague',
        senderEmail: senderEmail || '',
        dueDate: dueDate || ''
      };

      // Add the transaction ID if available
      if (paymentId) {
        emailData.transactionId = paymentId;
      }
      
      console.log('Sending email data:', emailData);
      
      // Make the API call to send the email
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/api/email/payment-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }

      setEmailSent(true);
      setStep(4);
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailError(error.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  // Render different steps of the form
  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search for a contact
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
          onClick={handlenewRequestRecipient}
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
      
      {payeeError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
          <p className="text-sm">{payeeError}</p>
        </div>
      )}
      
      {isnewRequestRecipient ? (
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
              value={newRequestRecipient.name}
              onChange={handlenewRequestRecipientChange}
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
              value={newRequestRecipient.email}
              onChange={handlenewRequestRecipientChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Recipient's email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wallet Address (Optional)
            </label>
            <input
              type="text"
              name="walletAddress"
              value={newRequestRecipient.walletAddress}
              onChange={handlenewRequestRecipientChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Solana wallet address"
            />
            <p className="text-xs text-gray-500 mt-1">
              If provided, this payee will be added to your contacts
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship
            </label>
            <select
              name="relationship"
              value={newRequestRecipient.relationship}
              onChange={handlenewRequestRecipientChange}
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
              Your Email (For Communication)*
            </label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Your email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name*
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Your name"
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
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">Payment request created successfully!</p>
        </div>
        
        {transactionError && (
          <div className="mb-4 bg-orange-50 text-orange-700 p-2 rounded-lg text-sm">
            <p className="break-words">Transaction warning: {transactionError}</p>
            <p className="text-xs mt-1">You can still send the payment request, but tracking might be limited.</p>
          </div>
        )}
        
        {emailError && (
          <div className="mb-4 bg-red-50 text-red-700 p-2 rounded-lg text-sm">
            <p className="break-words">{emailError}</p>
            <button 
              onClick={handleSendEmail} 
              className="mt-1 text-xs font-medium hover:underline"
            >
              Try Again
            </button>
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
            <p className="font-medium break-words">{selectedPayee?.name || newRequestRecipient.name}</p>
            <p className="text-sm text-gray-600 break-words">{selectedPayee?.email || newRequestRecipient.email}</p>
            {(selectedPayee?.walletAddress || newRequestRecipient.walletAddress) && (
              <p className="text-xs text-gray-500 font-mono break-all mt-1">
                Wallet: {selectedPayee?.walletAddress || newRequestRecipient.walletAddress}
              </p>
            )}
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
            setIsnewRequestRecipient(false);
            setAmount('');
            setDescription('');
            setDueDate('');
            setPaymentLink('');
            setEmailSent(false);
            setPaymentId(null);
          }}
          className="py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Create New Request
        </button>
        <button
          onClick={sendingEmail || addingPayee || creatingTransaction ? null : handleSendEmail}
          className="py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          disabled={sendingEmail || addingPayee || creatingTransaction}
        >
          {sendingEmail || addingPayee || creatingTransaction ? (
            <div className="flex items-center">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              {creatingTransaction ? "Creating Transaction..." : addingPayee ? "Adding Contact..." : "Sending..."}
            </div>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </div>
  );

  // Add a new step 4 component for success with confetti
  const renderStep4 = () => (
    <div className="mt-8 bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto">
      {/* Add confetti animation */}
      <Confetti 
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={500}
        gravity={0.15}
      />
      
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <svg className="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Payment Request Sent!</h3>
        <p className="text-gray-600 mb-6">
          Your payment request has been successfully sent to {(selectedPayee || newRequestRecipient).name}.
        </p>
        
        {paymentId && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Transaction Details</h4>
            <p className="text-sm text-gray-700 mb-1">Transaction ID: <span className="font-mono bg-blue-100 px-2 py-1 rounded">{paymentId}</span></p>
            <p className="text-sm text-gray-600">This transaction is now being tracked with status: <span className="font-semibold text-blue-700">Requested</span></p>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <button 
            onClick={() => {
              setStep(1);
              setSelectedPayee(null);
              setIsnewRequestRecipient(false);
              setAmount('');
              setDescription('');
              setDueDate('');
              setPaymentLink('');
              setEmailSent(false);
              setEmailError(null);
              setPaymentId(null);
            }}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Request Another Payment
          </button>
          <Link 
            to="/history" 
            className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center"
          >
            View Payment History
          </Link>
        </div>
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
          {step === 4 && renderStep4()}
        </div>
      </div>
    </div>
  );
};

export default RequestPaymentForm; 