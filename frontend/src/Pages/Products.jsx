import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const { addToCart } = useCart();
    const location = useLocation();

    // Lấy từ khóa tìm kiếm từ query param
    const searchParams = new URLSearchParams(location.search);
    const search = searchParams.get('search') || '';

    useEffect(() => {
        fetchProducts();
    }, [selectedType, search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Fetching products with type:', selectedType); // Debug log
            
            let url = 'http://localhost:8000/products/';
            if (selectedType) {
                url += `?product_type=${selectedType}`;
            }
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }
            
            console.log('Request URL:', url); // Debug log
            
            const response = await axios.get(url);
            console.log('Response data:', response.data); // Debug log
            
            setProducts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async (productId) => {
        try {
            await addToCart(productId, 1);
        } catch (err) {
            console.error('Error adding to cart:', err);
        }
    };

    const handleTypeFilter = (type) => {
        console.log('Selected type:', type); // Debug log
        setSelectedType(type === selectedType ? null : type);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Products</h1>
            
            {/* Filter Buttons */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => handleTypeFilter('newest')}
                    className={`px-4 py-2 rounded ${
                        selectedType === 'newest' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Newest
                </button>
                <button
                    onClick={() => handleTypeFilter('trending')}
                    className={`px-4 py-2 rounded ${
                        selectedType === 'trending' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Trending
                </button>
                <button
                    onClick={() => handleTypeFilter('best_seller')}
                    className={`px-4 py-2 rounded ${
                        selectedType === 'best_seller' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Best Seller
                </button>
            </div>
            
            {products.length === 0 ? (
                <div className="text-center text-gray-600">
                    <p>No products found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
                                <p className="text-gray-600 mb-2">{product.short_description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">
                                        {product.currentPrice ? (
                                            <>
                                                <span className="text-red-600">{product.currentPrice.toLocaleString('vi-VN')}đ</span>
                                                <span className="text-gray-500 line-through ml-2">{product.price.toLocaleString('vi-VN')}đ</span>
                                            </>
                                        ) : (
                                            <span>{product.price.toLocaleString('vi-VN')}đ</span>
                                        )}
                                    </span>
                                    <button
                                        onClick={() => handleAddToCart(product.id)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                                {product.tag && (
                                    <span className="inline-block bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-sm mt-2">
                                        {product.tag}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Products;