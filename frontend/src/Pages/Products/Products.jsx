import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Eye, Filter, Star } from 'lucide-react';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState({ id: 0, product: 'all' });
  const [sortOption, setSortOption] = useState('default');
  const [filters, setFilters] = useState({
    brand: [],
    priceRange: [],
  });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/products');
        if (response.data && Array.isArray(response.data.products)) {
          const activeProducts = response.data.products
            .filter((product) => product.status === 'active')
            .map((product) => ({
              ...product,
              status: product.status.charAt(0).toUpperCase() + product.status.slice(1),
              rating: product.rating || Math.floor(Math.random() * 5) + 1,
            }));
          setProducts(activeProducts);
        } else {
          setError('Invalid data format received from server');
          toast.error('Invalid data format received from server');
        }
      } catch (error) {
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

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((item) => item !== value)
        : [...prev[filterType], value],
    }));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const productTitle = [
    { id: 0, title: 'All', product: 'all' },
    { id: 1, title: 'Newest', product: 'newest' },
    { id: 2, title: 'Trending', product: 'trending' },
    { id: 3, title: 'Best Seller', product: 'best_seller' },
  ];

  const brands = ['Apple', 'Dell', 'HP', 'Asus', 'Lenovo'];
  const priceRanges = [
    { label: 'Under 10M', min: 0, max: 10000000 },
    { label: '10M - 20M', min: 10000000, max: 20000000 },
    { label: '20M - 30M', min: 20000000, max: 30000000 },
    { label: 'Above 30M', min: 30000000, max: Infinity },
  ];

  const filteredProducts = products
    .filter((p) => activeFilter.product === 'all' || p.product_type === activeFilter.product)
    .filter((p) => (filters.brand.length ? filters.brand.includes(p.brand) : true))
    .filter((p) => {
      if (!filters.priceRange.length) return true;
      return filters.priceRange.some((range) => {
        const [min, max] = range.split('-').map(Number);
        const price = p.currentPrice || p.price;
        return price >= min && price <= max;
      });
    })
    .sort((a, b) => {
      if (sortOption === 'price-low-high') return (a.currentPrice || a.price) - (b.currentPrice || b.price);
      if (sortOption === 'price-high-low') return (b.currentPrice || b.price) - (a.currentPrice || a.price);
      if (sortOption === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin h-12 w-12 text-teal-500">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-red-500 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2 px-6 rounded-lg hover:bg-teal-600 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  if (!filteredProducts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-white mb-4">No Products Found</h2>
          <p className="text-gray-600 dark:text-gray-300">There are no products available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="relative w-full h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://m-cdn.phonearena.com/images/article/64576-wide-two_1200/The-Best-Phones-in-2025-Our-top-recommendations.jpg)' }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.h1
            className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Explore Our Products
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div variants={containerVariants} initial="initial" animate="animate" className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-6 sticky top-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Filter size={20} /> Filters
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</h3>
              {brands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={filters.brand.includes(brand)}
                    onChange={() => handleFilterChange('brand', brand)}
                    className="form-checkbox text-teal-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">{brand}</span>
                </label>
              ))}
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</h3>
              {priceRanges.map((range) => (
                <label key={range.label} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={filters.priceRange.includes(`${range.min}-${range.max}`)}
                    onChange={() => handleFilterChange('priceRange', `${range.min}-${range.max}`)}
                    className="form-checkbox text-teal-500"
                  />
                  <span className="text-gray-600 dark:text-gray-400">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                {productTitle.map((title) => (
                  <motion.button
                    key={title.id}
                    onClick={() => setActiveFilter(title)}
                    className={`text-lg font-semibold transition-all duration-300 relative ${
                      activeFilter.id === title.id
                        ? 'text-teal-500 after:content-[""] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-teal-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-teal-500'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {title.title}
                  </motion.button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-gray-600 dark:text-gray-300">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="default">Default</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="relative aspect-square">
                    <img
                      src={product.image && product.image.startsWith('http') ? product.image : `http://localhost:8000/${product.image}`}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 hover:scale-105 lazyload"
                      loading="lazy"
                      onError={(e) => {
                        console.log('Image load error for product:', { id: product.id, title: product.title, image: product.image });
                        e.target.src = 'https://placeholder.co/400x400?text=No+Image';
                      }}
                    />
                    {product.tag && (
                      <span className="absolute top-2 right-2 bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                        {product.tag.charAt(0).toUpperCase() + product.tag.slice(1)}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <motion.button
                          onClick={(e) => handleAddToCart(e, product)}
                          className="bg-white p-3 rounded-full hover:bg-teal-500 hover:text-white transition-colors duration-300 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ShoppingCart size={20} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleProductClick(product.id)}
                          className="bg-white p-3 rounded-full hover:bg-teal-500 hover:text-white transition-colors duration-300 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 hover:text-teal-500 transition-colors duration-300 line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                      <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">({product.rating || 0})</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                      {product.short_description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="price">
                        <span className="text-teal-500 font-bold text-xl">
                          {(product.currentPrice || product.price)?.toLocaleString('vi-VN')}₫
                        </span>
                        {product.currentPrice && (
                          <span className="text-gray-500 line-through ml-2 text-sm">
                            {product.price?.toLocaleString('vi-VN')}₫
                          </span>
                        )}
                      </div>
                      <motion.button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add to Cart
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Products;