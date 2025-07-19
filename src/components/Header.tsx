import React from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import CartIcon from './icons/CartIcon';

interface HeaderProps {
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { state } = useCart();
  const { settings, loading } = useSettings();
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <a href="#/" className="text-2xl font-bold text-gray-800 tracking-wider">
          {loading ? (
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          ) : settings ? (
            <div className="flex items-center gap-3">
              {settings.logo_url && <img src={settings.logo_url} alt={`${settings.store_name} Logo`} className="h-8 w-auto" />}
              <h1>{settings.store_name}</h1>
            </div>
          ) : (
            <h1>Chic Threads</h1>
          )}
        </a>
        <button
          onClick={onCartClick}
          className="relative text-gray-600 hover:text-teal-600 transition-colors duration-300"
          aria-label="Open shopping cart"
        >
          <CartIcon className="h-7 w-7" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
