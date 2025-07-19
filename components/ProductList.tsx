import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, SortOption } from '../types';
import ProductCard from './ProductCard';
import SearchIcon from './icons/SearchIcon';

interface ProductListProps {
  onViewDetails: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onViewDetails }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState<SortOption>('default');
  
  const categories = useMemo(() => ['all', 'Jackets', 'Shirts', 'Pants', 'Sweaters', 'Shoes', 'T-Shirts', 'Accessories'], []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortOption !== 'default') params.append('sortBy', sortOption);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (e) {
      console.error("Failed to fetch products:", e);
      setError("Oops! We couldn't load our collection. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortOption]);

  useEffect(() => {
    const timer = setTimeout(() => {
        fetchProducts();
    }, 300); // Debounce API calls
    
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleClearFilters = () => {
      setSearchTerm('');
      setSelectedCategory('all');
      setSortOption('default');
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md mb-8 sticky top-[85px] z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            <div className="relative lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                <input
                    id="search"
                    type="text"
                    placeholder="e.g., 'denim jacket'..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 pt-6 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
            </div>
            <div>
                 <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                 <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                 >
                    {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
                </select>
            </div>
            <div>
                 <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                 <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                 >
                    <option value="default">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                 </select>
            </div>
        </div>
        {(searchTerm || selectedCategory !== 'all' || sortOption !== 'default') && (
            <div className="mt-4 text-right">
                <button 
                    onClick={handleClearFilters}
                    className="text-sm text-teal-600 hover:text-teal-800 font-semibold"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading our curated styles...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-600 font-semibold text-lg">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-600 font-semibold text-lg">No products found.</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductList;