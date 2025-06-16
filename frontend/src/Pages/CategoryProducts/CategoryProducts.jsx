import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SectionTitle from '../../Components/SectionTitle/SectionTitle';
import { ShoppingCart, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';

const CategoryProducts = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState({ id: 0, product: 'all' });
    const { addToCart } = useCart();

    useEffect(() => {
        fetchCategoryAndProducts();
    }, [categoryId]);

    const fetchCategoryAndProducts = async () => {
        try {
            // Fetch category details
            const categoryResponse = await axios.get(`http://127.0.0.1:8000/categories/${categoryId}`);
            setCategory(categoryResponse.data);

            // Fetch products for this category
            const productsResponse = await axios.get(`http://127.0.0.1:8000/products/category/${categoryId}`);
            setProducts(productsResponse.data);
        } catch (error) {
            console.error("Error fetching category products:", error);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000/static/${imagePath}`;
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation(); // Prevent navigation when clicking add to cart
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

    if (!category) {
        return (
            <div className="lg:container mx-auto">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Category Not Found</h2>
                    <p className="text-gray-600">The requested category does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="lg:container mx-auto px-4 py-8">
            <div className="flex flex-col items-center justify-center mb-12">
                <SectionTitle title={category.title} textAlign="center" mb="mb-8" />
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

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Products Found</h2>
                    <p className="text-gray-600">There are no products available in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            onClick={() => handleProductClick(product.id)}
                            className="product_card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="product_image relative group aspect-square">
                                <img
                                    src={getImageUrl(product.image)}
                                    alt={product.title}
                                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                />
                                {product.tag && (
                                    <span className="absolute top-2 right-2 bg-[#029fae] text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                                        {product.tag}
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
                                <div className="flex items-center justify-between">
                                    <div className="price">
                                        <span className="text-[#029fae] font-bold text-xl">${product.currentPrice}</span>
                                        {product.currentPrice && (
                                            <span className="text-gray-500 line-through ml-2">${product.price}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryProducts; 