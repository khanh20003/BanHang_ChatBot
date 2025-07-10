import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Smartphone, Check, Heart, Search, ShoppingCart, LogOut, X, Menu, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import authService from '../../services/authService';
import { clearChatSessionId } from '../../utils/chatSession';
import { debounce } from 'lodash';

const Navbar = () => {
  const { cart, removeFromCart } = useCart();
  const itemCount = cart?.cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    fetchCategories();
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8000/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSearchSuggestions = debounce(async (term) => {
  if (term.length < 2) {
    setSearchSuggestions([]);
    return;
  }
  try {
    const response = await axios.get(`http://127.0.0.1:8000/products?search=${encodeURIComponent(term)}&limit=10`);
    
    // 👉 Dữ liệu được trả về là { products: [...], total_products: N }
    const products = Array.isArray(response.data.products)
      ? response.data.products
      : [];

    setSearchSuggestions(products.slice(0, 5));
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    setSearchSuggestions([]);
  }
}, 300);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchSearchSuggestions(term);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchSuggestions([]);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    // Xóa session chat khi logout
    const user = authService.getCurrentUser();
    if (user && user.id) {
      clearChatSessionId(user.id);
    }
    authService.logout();
    setCurrentUser(null);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const containerVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const dropdownVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="sticky top-0 z-50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg shadow-xl"
    >
      {/* Navbar Top */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white h-12 flex items-center justify-center">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <motion.p variants={containerVariants} className="flex items-center gap-3 text-base font-semibold">
            <Check size={18} /> Miễn phí vận chuyển cho đơn hàng trên 2.000.000vnđ
          </motion.p>
          <div className="flex items-center gap-6">
            <select
              defaultValue="eng"
              className="bg-transparent text-base font-semibold focus:outline-none"
            >
              <option value="eng">English</option>
              <option value="vi">Tiếng Việt</option>
            </select>
            <motion.a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:text-teal-300 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
            >
              Facebook
            </motion.a>
            <motion.a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base hover:text-teal-300 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
            >
              Instagram
            </motion.a>
          </div>
        </div>
      </div>

      {/* Navbar Middle */}
      <div className="bg-white dark:bg-gray-900 py-5">
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <motion.div variants={containerVariants} className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="http://127.0.0.1:8000/static/images/logo/logo.png" alt="Logo" className="w-12 h-12" />
              <span className="text-3xl font-bold text-gray-800 dark:text-white">Device</span>
            </Link>
          </motion.div>

          {/* Search Bar */}
          <div className="hidden lg:block relative max-w-lg w-full">
            <form onSubmit={handleSearchSubmit}>
              <motion.input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700 rounded-lg pl-5 pr-12 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300"
                value={searchTerm}
                onChange={handleSearchChange}
                whileFocus={{ scale: 1.02 }}
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search size={24} className="text-gray-600 dark:text-gray-300" />
              </button>
            </form>
            <AnimatePresence>
              {searchSuggestions.length > 0 && (
                <motion.ul
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute top-full left-0 w-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-lg mt-2 shadow-xl z-10"
                >
                  {searchSuggestions.map((product) => (
                    <li
                      key={product.id}
                      className="px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white transition-colors duration-200 cursor-pointer text-base"
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setSearchTerm('');
                        setSearchSuggestions([]);
                      }}
                    >
                      {product.title}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          {/* Navbar Middle Right */}
          <div className="flex items-center gap-6">
            <motion.div
              variants={containerVariants}
              className="relative"
              onMouseEnter={() => setIsCartOpen(true)}
              onMouseLeave={() => setIsCartOpen(false)}
            >
              <Link to="/cart" className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <ShoppingCart size={28} />
                <span className="hidden md:inline text-lg">Giỏ Hàng</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-teal-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <AnimatePresence>
                {isCartOpen && itemCount > 0 && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute right-0 mt-3 w-72 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg shadow-xl p-5 z-10"
                  >
                    <h4 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Giỏ Hàng Của Bạn</h4>
                    {cart.cart.items.map((item) => (
                      <div key={item.id} className="flex gap-3 mb-3 items-center group">
                        <img
                          src={
                            item.product.image
                              ? item.product.image.startsWith('http')
                                ? item.product.image
                                : `http://127.0.0.1:8000/${item.product.image.replace(/^\/+/, '')}`
                              : 'https://placeholder.co/50'
                            }
                            alt={item.product.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        <div className="flex-1">
                          <p className="text-base text-gray-700 dark:text-gray-200 line-clamp-1">{item.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.quantity} x {item.price?.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                          title="Xóa khỏi giỏ hàng"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <Link
                      to="/cart"
                      className="block text-center bg-teal-500 text-white py-2 rounded-lg mt-3 hover:bg-teal-600 text-base"
                    >
                      Xem Giỏ Hàng
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div variants={containerVariants}>
              <Link to="/wishlist" className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                <Heart size={28} />
                <span className="hidden md:inline text-lg">Yêu Thích</span>
              </Link>
            </motion.div>
            <div
              className="relative"
              onMouseEnter={() => setIsAccountOpen(true)}
              onMouseLeave={() => setIsAccountOpen(false)}
            >
              <motion.div
                tabIndex={0}
                role="button"
                className="flex items-center gap-3 text-gray-700 dark:text-gray-200"
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsAccountOpen((prev) => !prev)}
              >
                {currentUser && currentUser.avatar ? (
                  <img
                    src={`http://127.0.0.1:8000${currentUser.avatar}`}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">User</span>
                  </div>
                )}
                <span className="hidden md:inline text-lg">
                  {currentUser ? currentUser.username || 'User' : 'Tài Khoản'}
                </span>
              </motion.div>
              <AnimatePresence>
                {isAccountOpen && (
                  <motion.ul
                    tabIndex={0}
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute right-0 mt-3 w-56 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg shadow-xl p-3 z-10"
                  >
                    {currentUser ? (
                      <>
                        <li
                          className="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white rounded-md cursor-pointer text-base"
                          onClick={() => {
                            navigate('/profile');
                            setIsAccountOpen(false);
                          }}
                        >
                          {currentUser.username || currentUser.email || 'User'}
                        </li>
                        <li>
                          <Link
                            to="/my-orders"
                            className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white rounded-md text-base"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Đơn hàng của tôi
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsAccountOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-500 hover:text-white rounded-md flex items-center text-base"
                          >
                            <LogOut size={18} className="mr-2" />
                            Đăng Xuất
                          </button>
                        </li>
                        
                      </>
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/auth/login"
                            className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white rounded-md text-base"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Đăng Nhập
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/auth/register"
                            className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white rounded-md text-base"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            Đăng Ký
                          </Link>
                        </li>
                      </>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar Bottom */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <motion.div
                tabIndex={0}
                role="button"
                className="flex items-center gap-3 text-gray-700 dark:text-gray-200"
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsCategoryOpen((prev) => !prev)}
              >
                <Menu size={24} />
                <span className="text-lg">Tất Cả Danh Mục</span>
              </motion.div>
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.ul
                    tabIndex={0}
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="absolute left-0 mt-3 w-56 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg shadow-xl p-3 z-10"
                  >
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          to={`/category/${category.id}`}
                          className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white rounded-md text-base"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200 hover:text-teal-500'} transition-colors duration-200`
                }
              >
                Trang Chủ
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200 hover:text-teal-500'} transition-colors duration-200`
                }
              >
                Sản Phẩm
              </NavLink>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200 hover:text-teal-500'} transition-colors duration-200`
                }
              >
                Giỏ Hàng
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200 hover:text-teal-500'} transition-colors duration-200`
                }
              >
                Giới Thiệu
              </NavLink>
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200 hover:text-teal-500'} transition-colors duration-200`
                }
              >
                Liên Hệ
              </NavLink>
            </nav>
          </div>
          <motion.div variants={containerVariants} className="hidden lg:flex items-center gap-3">
            <a href="tel:0838610344" className="text-base text-gray-600 dark:text-gray-200 hover:text-teal-500 transition-colors duration-200 flex items-center gap-3">
              <Smartphone size={20} />
              0838 610 344
            </a>
          </motion.div>
          <motion.button
            className="lg:hidden text-gray-600 dark:text-gray-200"
            onClick={toggleMobileMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </motion.button>
        </div>
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={dropdownVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="lg:hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-6"
            >
              <form onSubmit={handleSearchSubmit} className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full bg-white/70 dark:bg-gray-800/70 border border-gray-300 dark:border-gray-700 rounded-lg pl-5 pr-12 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Search size={24} className="text-gray-600 dark:text-gray-200" />
                  </button>
                </div>
                {searchSuggestions.length > 0 && (
                  <ul className="mt-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl">
                    {searchSuggestions.map((product) => (
                      <li
                        key={product.id}
                        className="px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-teal-500 hover:text-white cursor-pointer text-base"
                        onClick={() => {
                          navigate(`/product/${product.id}`);
                          setSearchTerm('');
                          setSearchSuggestions([]);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {product.title}
                      </li>
                    ))}
                  </ul>
                )}
              </form>
              <nav className="flex flex-col gap-5">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200'}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trang Chủ
                </NavLink>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200'}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sản Phẩm
                </NavLink>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200'}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Giỏ Hàng
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200'}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Giới Thiệu
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `text-base font-medium ${isActive ? 'text-teal-500' : 'text-gray-600 dark:text-gray-200'}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Liên Hệ
                </NavLink>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Navbar;