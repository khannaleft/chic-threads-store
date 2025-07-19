import React, { useState, useEffect, useCallback } from 'react';
import { ProductWithReviews, Review } from '../types';
import { useCart } from '../context/CartContext';
import CloseIcon from './icons/CloseIcon';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

interface ProductDetailModalProps {
  product: ProductWithReviews | null;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { dispatch } = useCart();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewError, setReviewError] = useState<string|null>(null);

  const fetchReviews = useCallback(async () => {
    if (!product) return;
    setLoadingReviews(true);
    setReviewError(null);
    try {
      const response = await fetch(`/api/reviews?productId=${product.id}`);
      if (!response.ok) {
        throw new Error('Failed to load reviews.');
      }
      const data = await response.json();
      setReviews(data);
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoadingReviews(false);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
        fetchReviews();
    }
  }, [product, fetchReviews]);

  if (!product) return null;

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
    onClose();
  };

  const handleReviewAdded = () => {
    fetchReviews(); // Refetch reviews when a new one is added
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row flex-shrink-0">
          <div className="w-full md:w-1/2 h-64 md:h-auto relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 bg-white bg-opacity-75 rounded-full p-1 z-10 transition-colors"
                aria-label="Close product details"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
            <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-md text-gray-500 mt-2">{product.category}</p>
            <div className="my-4 flex items-center">
                <StarRating rating={product.avg_rating || 0} />
                <span className="text-sm text-gray-600 ml-2">{product.review_count} reviews</span>
            </div>
            <p className="text-3xl font-light text-teal-600 mb-4">${product.price.toFixed(2)}</p>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-md hover:bg-teal-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
            >
              Add to Cart
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Customer Reviews</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                  <h4 className="text-xl font-semibold text-gray-700">What others are saying</h4>
                  {loadingReviews && <p>Loading reviews...</p>}
                  {reviewError && <p className="text-red-500">{reviewError}</p>}
                  {!loadingReviews && reviews.length === 0 && <p className="text-gray-500">No reviews yet. Be the first!</p>}
                  
                  <div className="space-y-6 max-h-64 overflow-y-auto pr-4">
                  {reviews.map(review => (
                      <div key={review.id} className="border-b pb-4">
                          <div className="flex items-center mb-1">
                              <StarRating rating={review.rating} />
                              <p className="ml-3 font-semibold text-gray-800">{review.author_name}</p>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{new Date(review.created_at).toLocaleDateString()}</p>
                          <p className="text-gray-700">{review.comment}</p>
                      </div>
                  ))}
                  </div>
              </div>
              <div>
                  <h4 className="text-xl font-semibold text-gray-700 mb-4">Leave a Review</h4>
                  <ReviewForm productId={product.id} onReviewAdded={handleReviewAdded} />
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
