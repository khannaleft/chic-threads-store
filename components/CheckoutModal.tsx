import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { OrderDetails, Order } from '../types';
import CloseIcon from './icons/CloseIcon';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialDetails: OrderDetails = {
    name: '',
    email: '',
    phone: '',
    deliveryMethod: 'delivery',
    address: '',
    city: '',
    state: '',
    zip: '',
};

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { state: cartState, dispatch } = useCart();
  const [customerDetails, setCustomerDetails] = useState<OrderDetails>(initialDetails);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState<Order | null>(null);

  const subtotal = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    // Clear address fields if user switches to pickup for better UX
    if (customerDetails.deliveryMethod === 'pickup') {
      setCustomerDetails(prev => ({
        ...prev,
        address: '',
        city: '',
        state: '',
        zip: '',
      }));
    }
  }, [customerDetails.deliveryMethod]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDeliveryMethodChange = (method: 'delivery' | 'pickup') => {
    setCustomerDetails(prev => ({ ...prev, deliveryMethod: method }));
  };

  const handleClose = () => {
    if (status !== 'loading') {
      setStatus('idle');
      setError(null);
      setCustomerDetails(initialDetails);
    }
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    // Frontend validation
    if (customerDetails.deliveryMethod === 'delivery' && (!customerDetails.address || !customerDetails.city || !customerDetails.state || !customerDetails.zip)) {
        setError("Please fill out all address fields for delivery.");
        setStatus('error');
        return;
    }

    try {
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails,
          cartItems: cartState.items,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order.');
      }

      const order: Order = await response.json();
      setNewOrder(order);
      setStatus('success');
      dispatch({ type: 'CLEAR_CART' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close checkout"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        {status === 'success' && newOrder ? (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-teal-600 mb-4">Thank You!</h2>
                <p className="text-gray-700">Your order has been placed successfully.</p>
                {newOrder.delivery_method === 'delivery' ? (
                     <p className="text-gray-600 mt-2">A confirmation email has been sent to <span className="font-semibold text-gray-800">{newOrder.customer_email}</span>.</p>
                ) : (
                    <p className="text-gray-600 mt-2">We've sent a confirmation to <span className="font-semibold text-gray-800">{newOrder.customer_email}</span>. We'll notify you again when your order is ready for pickup.</p>
                )}
                <p className="text-gray-700 mt-4">Your Order ID is: <span className="font-semibold">#{newOrder.id}</span></p>
                <button onClick={onClose} className="mt-6 w-full bg-teal-500 text-white font-bold py-3 rounded-md hover:bg-teal-600 transition-colors">
                    Continue Shopping
                </button>
            </div>
        ) : (
            <>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Complete Your Order</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Method</label>
                           <div className="flex rounded-md shadow-sm">
                               <button type="button" onClick={() => handleDeliveryMethodChange('delivery')} className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-teal-500 ${customerDetails.deliveryMethod === 'delivery' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Delivery</button>
                               <button type="button" onClick={() => handleDeliveryMethodChange('pickup')} className={`-ml-px flex-1 py-2 px-4 text-sm font-medium rounded-r-md focus:z-10 focus:outline-none focus:ring-2 focus:ring-teal-500 ${customerDetails.deliveryMethod === 'pickup' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>In-store Pickup</button>
                           </div>
                        </div>

                        <hr className="my-6" />

                        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" value={customerDetails.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" name="email" id="email" value={customerDetails.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
                        </div>
                         <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" name="phone" id="phone" value={customerDetails.phone} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
                        </div>

                        {customerDetails.deliveryMethod === 'delivery' && (
                            <div className="space-y-4 pt-4">
                                <hr/>
                                <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Street Address</label>
                                    <input type="text" name="address" id="address" value={customerDetails.address} onChange={handleChange} required={customerDetails.deliveryMethod === 'delivery'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                        <input type="text" name="city" id="city" value={customerDetails.city} onChange={handleChange} required={customerDetails.deliveryMethod === 'delivery'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                                        <input type="text" name="state" id="state" value={customerDetails.state} onChange={handleChange} required={customerDetails.deliveryMethod === 'delivery'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
                                    </div>
                                    <div>
                                        <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Zip / Postal Code</label>
                                        <input type="text" name="zip" id="zip" value={customerDetails.zip} onChange={handleChange} required={customerDetails.deliveryMethod === 'delivery'} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500"/>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className="pt-4">
                            <div className="flex justify-between items-center text-lg font-semibold text-gray-800">
                                <span>Order Total</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div>
                            <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 mt-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 transition-colors">
                                {status === 'loading' ? 'Placing Order...' : `Place Order for $${subtotal.toFixed(2)}`}
                            </button>
                        </div>
                    </form>
                    {status === 'error' && error && (
                        <div className="mt-4 text-center p-3 bg-red-100 text-red-800 rounded-md">
                            Error: {error}
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;