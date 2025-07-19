import React from 'react';
import { useCart } from '../context/CartContext';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import TrashIcon from './icons/TrashIcon';
import { CartItem } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onProceedToCheckout }) => {
  const { state, dispatch } = useCart();
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleUpdateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const handleRemoveItem = (id: number) => {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors" aria-label="Close cart">
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          {state.items.length === 0 ? (
            <div className="flex-grow flex flex-col justify-center items-center text-gray-500">
              <p className="text-lg">Your cart is empty.</p>
              <button onClick={onClose} className="mt-4 bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors">
                  Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {state.items.map((item: CartItem) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                      <div className="flex items-center mt-2">
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full border hover:bg-gray-100"><MinusIcon className="h-4 w-4" /></button>
                        <span className="px-3 font-semibold">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full border hover:bg-gray-100"><PlusIcon className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="h-5 w-5"/></button>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Shipping and taxes calculated at checkout.</p>
                <button 
                  onClick={onProceedToCheckout}
                  className="w-full mt-4 bg-teal-500 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-600 transition-colors">
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;
