
import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import CloseIcon from './icons/CloseIcon';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { dispatch } = useCart();

  if (!product) return null;

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Close product details"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
          <p className="text-md text-gray-500 mt-2">{product.category}</p>
          <p className="text-3xl font-light text-teal-600 my-6">${product.price.toFixed(2)}</p>
          <p className="text-gray-700 leading-relaxed flex-grow">{product.description}</p>
          <button
            onClick={handleAddToCart}
            className="mt-8 w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
