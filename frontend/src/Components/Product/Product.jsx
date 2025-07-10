import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { FiSearch } from 'react-icons/fi';

const PRODUCTS_PER_PAGE = 8;

const ProductSection = () => {
  const [active, setActive] = useState({ id: 0, product: 'all' });
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        skip: (currentPage - 1) * PRODUCTS_PER_PAGE,
        limit: PRODUCTS_PER_PAGE,
        ...(active.product !== 'all' && { product_type: active.product }),
        ...(searchTerm && { search: searchTerm }),
        status: 'active', // Chỉ lấy sản phẩm active
      });
      const response = await axios.get(`http://localhost:8000/products?${params}`);
      setProducts(response.data.products);
      setTotalProducts(response.data.total_products);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, active.product, searchTerm]);

  const debouncedFetchProducts = useCallback(debounce(fetchProducts, 500), [fetchProducts]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://placeholder.co/400x400?text=No+Image';
    return imagePath.startsWith('http') ? imagePath : `http://localhost:8000/static/${imagePath}`;
  };

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
    { id: 0, title: 'all', product: 'all' },
    { id: 1, title: 'newest', product: 'newest' },
    { id: 2, title: 'trending', product: 'trending' },
    { id: 3, title: 'best seller', product: 'best_seller' },
  ];

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [currentPage, active.product, searchTerm, debouncedFetchProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [active, searchTerm]);

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    hover: { scale: 1.03, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
    hover: { scale: 1.1, transition: { duration: 0.2, ease: 'easeOut' } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="container mx-auto px-4 py-12 dark:bg-gray-900 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-12"
      >
        <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
          Our Products
        </h2>
        <div className="flex flex-col sm:flex-row items-center gap-6 bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg p-3 rounded-full shadow-md w-full max-w-2xl">
          <div className="flex items-center gap-4">
            {productTitle.map((title) => (
              <motion.button
                key={title.id}
                onClick={() => setActive(title)}
                className={`relative px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  active.id === title.id
                    ? 'bg-teal-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-teal-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
              >
                {title.title}
                {active.id === title.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-500"
                    layoutId="underline"
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                )}
              </motion.button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 hover:shadow-md transition-all dark:bg-gray-800 dark:text-white dark:border-gray-600"
              disabled={loading}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(PRODUCTS_PER_PAGE)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : !products.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              No Products Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              There are no products available in this category.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="group bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-md overflow-hidden cursor-pointer"
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <LazyLoadImage
                    src={getImageUrl(product.image)}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    effect="blur"
                    placeholderSrc="https://placeholder.co/400x400?text=Loading"
                    width="100%"
                    height="100%"
                  />
                  {product.tag && (
                    <span className="absolute top-3 right-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm z-10">
                      {product.tag}
                    </span>
                  )}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
                  >
                    <motion.div
                      className="flex gap-3"
                      variants={buttonVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <motion.button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2.5 rounded-full hover:bg-teal-500 hover:text-white transition-colors duration-200 shadow-sm"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <ShoppingCart size={16} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleProductClick(product.id)}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2.5 rounded-full hover:bg-teal-500 hover:text-white transition-colors duration-200 shadow-sm"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Eye size={16} />
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-teal-500 transition-colors duration-200 ease-out line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {product.short_description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="price">
                      <span className="text-teal-500 dark:text-teal-400 font-bold text-base">
                        {(product.currentPrice || product.price)?.toLocaleString('vi-VN')}₫
                      </span>
                      {product.currentPrice && (
                        <span className="text-gray-500 dark:text-gray-600 line-through ml-2 text-sm">
                          {product.price?.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {totalProducts > 0 && (
        <div className="flex justify-center mt-8 gap-2">
          <motion.button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-teal-500 hover:text-white disabled:opacity-50 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Prev
          </motion.button>
          {/* Pagination numbers with ellipsis */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(pageNum => {
              // Always show first, last, current, and neighbors
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1
              ) {
                return true;
              }
              // Hide others
              return false;
            })
            .reduce((acc, pageNum, idx, arr) => {
              // Insert ellipsis if needed
              if (
                idx > 0 &&
                pageNum - arr[idx - 1] > 1
              ) {
                acc.push('ellipsis');
              }
              acc.push(pageNum);
              return acc;
            }, [])
            .map((item, idx) =>
              item === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 select-none">...</span>
              ) : (
                <motion.button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`px-4 py-2 rounded-full border ${
                    currentPage === item
                      ? 'bg-teal-500 text-white border-teal-500'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-teal-500 hover:text-white'
                  } transition-all duration-200`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  {item}
                </motion.button>
              )
            )}
          <motion.button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-teal-500 hover:text-white disabled:opacity-50 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Next
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ProductSection;