import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import SettingsForm from '../components/SettingsForm';

const SESSION_STORAGE_KEY = 'chic-threads-admin-auth';

type AdminTab = 'products' | 'settings';

const AdminPage: React.FC<{ onProductAdded: () => void }> = ({ onProductAdded }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  useEffect(() => {
    // Re-check session storage on component mount
    const auth = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if(auth) {
        try {
            const { pass, timestamp } = JSON.parse(auth);
            // Expire after 1 hour
            if (Date.now() - timestamp < 3600 * 1000) {
                setIsAuthenticated(true);
                setPassword(pass);
            } else {
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        } catch(e) {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      const authData = { pass: password, timestamp: Date.now() };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Password cannot be empty.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 flex justify-center">
        <div className="w-full max-w-md mt-10">
          <form onSubmit={handleLogin} className="bg-white shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******************"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
              >
                Sign In
              </button>
            </div>
             <p className="text-center text-gray-500 text-xs mt-6">
                Enter the admin password set in your environment variables.
            </p>
          </form>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'products':
        return (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Add New Product</h2>
              <ProductForm onProductAdded={onProductAdded} adminPassword={password} />
            </>
        );
      case 'settings':
        return (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Store Settings</h2>
              <SettingsForm adminPassword={password} />
            </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
        <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Product Management
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Store Settings
                </button>
            </nav>
        </div>
        {renderTabContent()}
    </div>
  );
};

export default AdminPage;
