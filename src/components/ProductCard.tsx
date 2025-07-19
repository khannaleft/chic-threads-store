import React from 'react';
import { ProductWithReviews } from '../types';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

interface ProductCardProps {
  product: ProductWithReviews;
  onViewDetails: (product: ProductWithReviews) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { dispatch } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'ADD_ITEM', payload: product });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onViewDetails(product)}
    >
      <div className="relative h-64 w-full">
        <img
          className="h-full w-full object-cover"
          src={product.imageUrl}
          alt={product.name}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-gray-500 text-sm mt-1">{product.category}</p>
        
        <div className="mt-2 flex items-center">
            <StarRating rating={product.avg_rating || 0} />
            <span className="text-xs text-gray-500 ml-2">({product.review_count} reviews)</span>
        </div>

        <p className="text-xl font-bold text-gray-900 mt-2">${product.price.toFixed(2)}</p>
        <div className="mt-6 flex-grow flex items-end">
          <button
            onClick={handleAddToCart}
            className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
