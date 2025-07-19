import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import CartSidebar from './components/CartSidebar';
import { ProductWithReviews } from './types';
import ProductDetailModal from './components/ProductDetailModal';
import StyleAdvisor from './components/StyleAdvisor';
import AdminPage from './pages/AdminPage';
import CheckoutModal from './components/CheckoutModal';
import { useSettings } from './context/SettingsContext';
import InstagramIcon from './components/icons/InstagramIcon';
import WhatsappIcon from './components/icons/WhatsappIcon';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithReviews | null>(null);
  const [route, setRoute] = useState(window.location.hash);
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const { settings } = useSettings();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleViewDetails = (product: ProductWithReviews) => {
    setSelectedProduct(product);
  };

  const handleProductAdded = () => {
    setRefreshKey(Date.now());
    window.location.hash = '#/';
  };
  
  const handleProceedToCheckout = () => {
      setIsCartOpen(false);
      setIsCheckoutOpen(true);
  };

  const renderPage = () => {
    switch (route) {
      case '#/admin':
        return <AdminPage onProductAdded={handleProductAdded} />;
      default:
        return (
          <>
            <main className="container mx-auto px-6 py-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-extrabold text-gray-800">Our Collection</h2>
                <p className="text-lg text-gray-600 mt-2">Curated styles for the modern individual.</p>
              </div>
              <ProductList onViewDetails={handleViewDetails} key={refreshKey} />
            </main>
            <footer className="bg-white mt-12 py-8 border-t">
              <div className="container mx-auto px-6 text-center text-gray-600">
                {settings && (
                  <>
                    <div className="flex justify-center items-center space-x-6 mb-4">
                      {settings.instagram_id && (
                        <a href={`https://instagram.com/${settings.instagram_id}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-500 hover:text-teal-600 transition-colors">
                          <InstagramIcon className="w-6 h-6" />
                        </a>
                      )}
                      {settings.whatsapp_number && (
                        <a href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-gray-500 hover:text-teal-600 transition-colors">
                          <WhatsappIcon className="w-6 h-6" />
                        </a>
                      )}
                    </div>
                    {settings.shop_address && <p className="text-sm mb-2">{settings.shop_address}</p>}
                  </>
                )}
                <p>&copy; {new Date().getFullYear()} {settings?.store_name || 'Chic Threads'}. All Rights Reserved.</p>
                <p className="text-sm mt-1">
                  A Fictional Store for Demonstration Purposes |{' '}
                  <a href="#/admin" className="text-teal-600 hover:underline font-semibold">
                    Admin Panel
                  </a>
                </p>
              </div>
            </footer>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header onCartClick={() => setIsCartOpen(true)} />
      {renderPage()}
      <CartSidebar 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          onProceedToCheckout={handleProceedToCheckout} 
      />
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <StyleAdvisor />
    </div>
  );
}

export default App;
