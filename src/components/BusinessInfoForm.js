import React, { useState, useEffect } from 'react';

const DEFAULT_BUSINESS_INFO = {
  name: 'Your Business Name',
  email: 'your-email@example.com',
  phone: '+1 (555) 000-0000',
  street: 'Your Business Address',
  city: 'City',
  state: 'State',
  zip: '00000',
  country: 'Country'
};

const LOCAL_STORAGE_KEY = 'businessInfo';

export default function BusinessInfoForm({ onChange }) {
  const [businessInfo, setBusinessInfo] = useState(DEFAULT_BUSINESS_INFO);
  const [saved, setSaved] = useState(false);

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
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-gray-700">Business Name</label>
        <input type="text" name="name" value={businessInfo.name} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Email</label>
          <input type="email" name="email" value={businessInfo.email} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input type="text" name="phone" value={businessInfo.phone} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Street</label>
        <input type="text" name="street" value={businessInfo.street} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input type="text" name="city" value={businessInfo.city} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <input type="text" name="state" value={businessInfo.state} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">ZIP</label>
          <input type="text" name="zip" value={businessInfo.zip} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Country</label>
        <input type="text" name="country" value={businessInfo.country} onChange={handleChange} className="mt-1 block w-full border rounded-md px-3 py-2" />
      </div>
      <button type="submit" className="bg-primary text-white px-6 py-2 rounded-md mt-4">Save Business Info</button>
      {saved && <span className="ml-4 text-green-600">Saved!</span>}
    </form>
  );
}
