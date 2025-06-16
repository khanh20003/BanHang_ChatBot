import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Eye } from 'lucide-react';
import SectionTitle from '../../Components/SectionTitle/SectionTitle';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [active, setActive] = useState({ id: 0, product: 'all' });
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Fetching products...');
                const response = await axios.get('http://127.0.0.1:8000/products');
                console.log('API Response:', response.data);
                
                if (Array.isArray(response.data)) {
                    // Filter out inactive products and capitalize status
                    const activeProducts = response.data
                        .filter(product => product.status === 'active')
                        .map(product => ({
                            ...product,
                            status: product.status.charAt(0).toUpperCase() + product.status.slice(1)
                        }));
                    setProducts(activeProducts);
                } else {
                    console.error('Invalid response format:', response.data);
                    setError('Invalid data format received from server');
                    toast.error('Invalid data format received from server');
                }
            } catch (error) {
                console.error('Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
                setError(error.message);
                toast.error(error.response?.data?.detail || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        try {
            await addToCart(product);
            toast.success('Product added to cart');
        } catch (error) {
            toast.error('Failed to add product to cart');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const productTitle = [
        { id: 0, title: "all", product: "all" },
        { id: 1, title: "newest", product: "newest" },
        { id: 2, title: "trending", product: "trending" },
        { id: 3, title: "best seller", product: "best_seller" }
    ];

    const filteredProducts = active.product === "all"
        ? products
        : products.filter(p => p.product_type === active.product);

    if (loading) {
        return (
            <div className="lg:container mx-auto min-h-[400px] flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-[#029fae]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lg:container mx-auto min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Products</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn bg-[#029fae] text-white hover:bg-[#007580]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="lg:container mx-auto min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Products Found</h2>
                    <p className="text-gray-600">There are no products available at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center mb-12">
                <SectionTitle title="Our Products" textAlign="center" mb="mb-8" />
                <div className="flex items-center justify-center gap-8 mb-11">
                    {productTitle.map((title) => (
                        <button 
                            key={title.id}
                            onClick={() => setActive(title)}
                            className={`text-base font-black uppercase font-inter cursor-pointer transition-all duration-300 relative ${
                                active.id === title.id 
                                    ? 'text-[#272343] after:content-[""] after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-[2px] after:bg-[#029fae]' 
                                    : 'text-[#9a9caa] hover:text-[#272343]'
                            }`}
                        >
                            {title.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <div 
                        key={product.id} 
                        onClick={() => handleProductClick(product.id)}
                        className="product_card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="product_image relative group aspect-square">
                            <img
                                src={product.image.startsWith('http') 
                                    ? product.image 
                                    : `http://127.0.0.1:8000/static/${product.image}`}
                                alt={product.title}
                                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                    console.error('Image load error:', product.image);
                                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                                }}
                            />
                            {product.tag && (
                                <span className="absolute top-2 right-2 bg-[#029fae] text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                                    {product.tag.charAt(0).toUpperCase() + product.tag.slice(1)}
                                </span>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                    <button 
                                        onClick={(e) => handleAddToCart(e, product)}
                                        className="bg-white p-3 rounded-full hover:bg-[#029fae] hover:text-white transition-colors duration-300 shadow-lg"
                                    >
                                        <ShoppingCart size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleProductClick(product.id)}
                                        className="bg-white p-3 rounded-full hover:bg-[#029fae] hover:text-white transition-colors duration-300 shadow-lg"
                                    >
                                        <Eye size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="product_info p-6">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800 hover:text-[#029fae] transition-colors duration-300 line-clamp-2">
                                {product.title}
                            </h3>
                            <div className="relative mb-3 group">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 pointer-events-none"></div>
                                <p className="text-gray-600 text-sm line-clamp-2 transition-all duration-300 group-hover:line-clamp-none group-hover:bg-gray-50 group-hover:p-2 group-hover:rounded-md group-hover:shadow-sm">
                                    {product.short_description || 'No description available'}
                                </p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="price">
                                    <span className="text-[#029fae] font-bold text-xl">${product.currentPrice || product.price}</span>
                                    {product.currentPrice && (
                                        <span className="text-gray-500 line-through ml-2">${product.price}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Products; 