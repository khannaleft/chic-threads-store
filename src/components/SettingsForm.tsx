import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { StoreSettings } from '../types';

interface SettingsFormProps {
  adminPassword?: string;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ adminPassword }) => {
  const { settings: initialSettings, loading, error: fetchError, refetchSettings } = useSettings();
  const [formData, setFormData] = useState<Partial<StoreSettings>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setFormData(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
      setSaveError("Authentication error. Please log in again.");
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    setSaveError(null);

    try {
      const response = await fetch('/api/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: formData, password: adminPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update settings.');
      }

      setStatus('success');
      refetchSettings(); 
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setSaveError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading settings...</div>;
  }

  if (fetchError) {
    return <div className="text-center p-8 text-red-500">Error loading settings: {fetchError}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">Store Name</label>
          <input type="text" name="store_name" id="store_name" value={formData.store_name || ''} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
        </div>
        <div>
          <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">Logo URL</label>
          <input type="text" name="logo_url" id="logo_url" value={formData.logo_url || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
        </div>
        <div>
          <label htmlFor="shop_address" className="block text-sm font-medium text-gray-700">Shop Address (for Pickups)</label>
          <textarea name="shop_address" id="shop_address" value={formData.shop_address || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
        </div>
        <div>
          <label htmlFor="instagram_id" className="block text-sm font-medium text-gray-700">Instagram Handle (e.g., chicthreads)</label>
          <input type="text" name="instagram_id" id="instagram_id" value={formData.instagram_id || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
        </div>
        <div>
          <label htmlFor="whatsapp_number" className="block text-sm font-medium text-gray-700">WhatsApp Number (with country code)</label>
          <input type="text" name="whatsapp_number" id="whatsapp_number" value={formData.whatsapp_number || ''} onChange={handleChange} placeholder="+1234567890" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
        </div>
        <div>
          <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 transition-colors">
            {status === 'loading' ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
      {status === 'success' && (
        <div className="mt-4 text-center p-4 bg-green-100 text-green-800 rounded-md">
          Settings updated successfully!
        </div>
      )}
      {status === 'error' && saveError && (
        <div className="mt-4 text-center p-4 bg-red-100 text-red-800 rounded-md">
          Error: {saveError}
        </div>
      )}
    </div>
  );
};

export default SettingsForm;
