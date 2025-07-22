import React, { useState, useEffect } from 'react';
import { FaBuilding, FaUniversity, FaWallet, FaCheck } from 'react-icons/fa';

const DEFAULT_BUSINESS_INFO = {
  // Business Info
  name: 'Your Business Name',
  email: 'your-email@example.com',
  phone: '+1 (555) 000-0000',
  street: 'Your Business Address',
  city: 'City',
  state: 'State',
  zip: '00000',
  country: 'Country',
  
  // Payment Info - Bank
  bankName: '',
  accountNumber: '',
  routingNumber: '',
  swiftCode: '',
  accountHolder: '',
  
  // Payment Info - Crypto
  walletAddress: '',
  chainType: 'solana',
  preferredPaymentMethod: 'crypto' // 'crypto', 'bank', 'both'
};

const LOCAL_STORAGE_KEY = 'businessInfo';

export default function BusinessInfoForm({ onChange }) {
  const [businessInfo, setBusinessInfo] = useState(DEFAULT_BUSINESS_INFO);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('business');

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setBusinessInfo(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (onChange) onChange(businessInfo);
  }, [businessInfo, onChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(businessInfo));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'business', label: 'Business Info', icon: FaBuilding },
    { id: 'bank', label: 'Bank Details', icon: FaUniversity },
    { id: 'crypto', label: 'Crypto Wallet', icon: FaWallet }
  ];

  return (
    <div className="max-w-4xl">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input 
                type="text" 
                name="name" 
                value={businessInfo.name} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={businessInfo.email} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={businessInfo.phone} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input 
                type="text" 
                name="street" 
                value={businessInfo.street} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  type="text" 
                  name="city" 
                  value={businessInfo.city} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input 
                  type="text" 
                  name="state" 
                  value={businessInfo.state} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input 
                  type="text" 
                  name="zip" 
                  value={businessInfo.zip} 
                  onChange={handleChange} 
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input 
                type="text" 
                name="country" 
                value={businessInfo.country} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
          </div>
        )}

        {/* Bank Details Tab */}
        {activeTab === 'bank' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Bank Information:</strong> This information will be included in your invoices for wire transfers and ACH payments.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input 
                type="text" 
                name="bankName" 
                value={businessInfo.bankName} 
                onChange={handleChange} 
                placeholder="e.g., Chase Bank, Bank of America"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input 
                  type="text" 
                  name="accountNumber" 
                  value={businessInfo.accountNumber} 
                  onChange={handleChange} 
                  placeholder="Your account number"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Routing Number</label>
                <input 
                  type="text" 
                  name="routingNumber" 
                  value={businessInfo.routingNumber} 
                  onChange={handleChange} 
                  placeholder="9-digit routing number"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code (for international)</label>
                <input 
                  type="text" 
                  name="swiftCode" 
                  value={businessInfo.swiftCode} 
                  onChange={handleChange} 
                  placeholder="Optional SWIFT code"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                <input 
                  type="text" 
                  name="accountHolder" 
                  value={businessInfo.accountHolder} 
                  onChange={handleChange} 
                  placeholder="Name on the account"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
                />
              </div>
            </div>
          </div>
        )}

        {/* Crypto Wallet Tab */}
        {activeTab === 'crypto' && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
              <p className="text-sm text-purple-800">
                <strong>Crypto Wallet:</strong> This wallet address will be included in your invoices for cryptocurrency payments.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blockchain Network</label>
              <select 
                name="chainType" 
                value={businessInfo.chainType} 
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
              >
                <option value="solana">Solana</option>
                <option value="ethereum">Ethereum</option>
                <option value="bitcoin">Bitcoin</option>
                <option value="polygon">Polygon</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Address</label>
              <input 
                type="text" 
                name="walletAddress" 
                value={businessInfo.walletAddress} 
                onChange={handleChange} 
                placeholder="Your wallet address for receiving payments"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary font-mono text-sm" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Token</label>
              <input 
                type="text" 
                name="token" 
                value={businessInfo.token || ''} 
                onChange={handleChange} 
                placeholder="e.g. USDC, ETH, SOL, BTC"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Payment Method</label>
              <select 
                name="preferredPaymentMethod" 
                value={businessInfo.preferredPaymentMethod} 
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
              >
                <option value="crypto">Crypto Only</option>
                <option value="bank">Bank Transfer Only</option>
                <option value="both">Both Crypto and Bank</option>
              </select>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center">
            {saved && (
              <div className="flex items-center text-green-600">
                <FaCheck className="mr-2" />
                <span className="text-sm font-medium">Information saved successfully!</span>
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors flex items-center"
          >
            <FaCheck className="mr-2" />
            Save Information
          </button>
        </div>
      </form>
    </div>
  );
}
