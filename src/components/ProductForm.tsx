import React, { useState } from 'react';
import { NewProduct } from '../types';

interface ProductFormProps {
  onProductAdded: () => void;
  adminPassword?: string;
}

const initialFormState: NewProduct = {
  name: '',
  price: 0,
  description: '',
  imageUrl: 'https://picsum.photos/seed/new-product/600/600',
  category: '',
};

const ProductForm: React.FC<ProductFormProps> = ({ onProductAdded, adminPassword }) => {
  const [productData, setProductData] = useState<NewProduct>(initialFormState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) {
        setError("Authentication error. Please log in again.");
        setStatus('error');
        return;
    }
    
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product: productData, password: adminPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product.');
      }

      setStatus('success');
      setProductData(initialFormState);
      setTimeout(() => {
        onProductAdded();
      }, 1500); 
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input type="text" name="name" id="name" value={productData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                <input type="number" name="price" id="price" value={productData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" value={productData.description} onChange={handleChange} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                <input type="text" name="imageUrl" id="imageUrl" value={productData.imageUrl} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"/>
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select name="category" id="category" value={productData.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                    <option value="">Select a category</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Pants">Pants</option>
                    <option value="Sweaters">Sweaters</option>
                    <option value="Shoes">Shoes</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Accessories">Accessories</option>
                </select>
            </div>
            <div>
                <button type="submit" disabled={status === 'loading'} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-gray-400 transition-colors">
                    {status === 'loading' ? 'Adding...' : 'Add Product'}
                </button>
            </div>
        </form>
        {status === 'success' && (
            <div className="mt-4 text-center p-4 bg-green-100 text-green-800 rounded-md">
                Product added successfully! Redirecting...
            </div>
        )}
        {status === 'error' && error && (
            <div className="mt-4 text-center p-4 bg-red-100 text-red-800 rounded-md">
                Error: {error}
            </div>
        )}
    </div>
  );
};

export default ProductForm;
