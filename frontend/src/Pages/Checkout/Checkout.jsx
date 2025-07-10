import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../../services/authService';
import API_URL from '../../config/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [formData, setFormData] = useState({
    shipping_name: '',
    shipping_phone: '',
    shipping_address: '',
    payment_method: 'cod',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [bankInfo, setBankInfo] = useState({
    bank: '',
    transaction_code: '',
    transfer_image: null,
  });

  const BANKS = {
    vcb: {
      name: 'Vietcombank',
      accountNumber: '1024932590',
      accountName: 'BUI TRAN BAO LOC',
      qr: 'http://127.0.0.1:8000/static/images/qr1.jpg',
    },
    mb: {
      name: 'MB Bank',
      accountNumber: '0838610344',
      accountName: 'BUI TRAN BAO LOC',
      qr: 'http://127.0.0.1:8000/static/images/qr.jpg',
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankInfoChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.payment_method === 'bank_transfer' && step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);

    try {
      const sessionId = localStorage.getItem('cartSessionId') || Date.now().toString();
      localStorage.setItem('cartSessionId', sessionId);

      const user = authService.getCurrentUser();
      if (!user || !user.access_token) {
        navigate('/auth/login');
        toast.error('Please login to place an order');
        return;
      }

      const payload = {
        ...formData,
        items: cart.cart.items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.price,
        })),
        ...(formData.payment_method === 'bank_transfer' ? bankInfo : {}),
      };

      const response = await axios.post(`${API_URL}/checkout/`, payload, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      clearCart();
      navigate('/order-success', {
        state: {
          order: response.data.order,
          payment: response.data.payment,
        },
      });
    } catch (err) {
      console.error('Error creating order:', err);
      if (err.response?.status === 401) {
        authService.logout();
        window.location.reload();
      } else if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          const errorMessages = err.response.data.detail.map((error) => error.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError('Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Variants cho animation
  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  if (!cart || !cart.cart || !cart.cart.items || cart.cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 dark:bg-gray-900 transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Your cart is empty
          </h2>
          <motion.button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 dark:bg-gray-900 transition-colors duration-300">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-800 dark:text-white mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600 text-center"
      >
        Checkout
      </motion.h1>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-teal-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
              }`}
            >
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Shipping Information
            </span>
          </div>
          <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full ${step === 2 ? 'bg-teal-500' : 'bg-transparent'}`}
              style={{ transition: 'width 0.3s ease-out' }}
            ></div>
          </div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 2 ? 'bg-teal-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Details
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-6 rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Order Summary
          </h2>
          <div className="space-y-4">
            {cart.cart.items.map((item) => (
              <motion.div
                key={item.id}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
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
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      {item.product.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </p>
              </motion.div>
            ))}
            <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                <span>Subtotal:</span>
                <span>{cart.subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                <span>Tax (10%):</span>
                <span>{cart.tax.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between mb-2 text-gray-700 dark:text-gray-300">
                <span>Shipping:</span>
                <span>{cart.shipping.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-white mt-4">
                <span>Total:</span>
                <span>{cart.total.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Checkout Form */}
        <motion.div
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-6 rounded-xl shadow-md"
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          key={step}
        >
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            {step === 1 ? 'Shipping Information' : 'Payment Details'}
          </h2>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div variants={formVariants} initial="initial" animate="animate" exit="exit">
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium"
                      htmlFor="shipping_name"
                    >
                      Full Name
                    </label>
                    <motion.input
                      type="text"
                      id="shipping_name"
                      name="shipping_name"
                      value={formData.shipping_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                      placeholder="Enter your full name"
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium"
                      htmlFor="shipping_phone"
                    >
                      Phone Number
                    </label>
                    <motion.input
                      type="tel"
                      id="shipping_phone"
                      name="shipping_phone"
                      value={formData.shipping_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                      placeholder="Enter your phone number"
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium"
                      htmlFor="shipping_address"
                    >
                      Shipping Address
                    </label>
                    <motion.textarea
                      id="shipping_address"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                      placeholder="Enter your shipping address"
                      rows="3"
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={formData.payment_method === 'cod'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="payment_method"
                          value="bank_transfer"
                          checked={formData.payment_method === 'bank_transfer'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Bank Transfer</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && formData.payment_method === 'bank_transfer' && (
                <motion.div variants={formVariants} initial="initial" animate="animate" exit="exit">
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                      Select Bank
                    </label>
                    <motion.select
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                      value={bankInfo.bank}
                      onChange={(e) => setBankInfo((prev) => ({ ...prev, bank: e.target.value }))}
                      required
                      whileFocus={{ scale: 1.02 }}
                    >
                      <option value="">-- Select Bank --</option>
                      <option value="vcb">Vietcombank</option>
                      <option value="mb">MB Bank</option>
                    </motion.select>
                  </div>

                  {bankInfo.bank && BANKS[bankInfo.bank] && (
                    <motion.div
                      className="mb-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-2 font-semibold text-gray-800 dark:text-white">
                        {BANKS[bankInfo.bank].name}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        Account Number: <span className="font-mono">{BANKS[bankInfo.bank].accountNumber}</span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        Account Name: <span className="font-mono">{BANKS[bankInfo.bank].accountName}</span>
                      </div>
                      <motion.div
                        className="mt-3"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img
                          src={BANKS[bankInfo.bank].qr}
                          alt={`QR ${BANKS[bankInfo.bank].name}`}
                          className="w-32 rounded-lg shadow-sm"
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                      Transaction Code (Optional)
                    </label>
                    <motion.input
                      type="text"
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                      value={bankInfo.transaction_code}
                      onChange={(e) => setBankInfo((prev) => ({ ...prev, transaction_code: e.target.value }))}
                      placeholder="Enter transaction code"
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                      Proof of Transfer (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBankInfo((prev) => ({ ...prev, transfer_image: e.target.files[0] }))}
                      className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-teal-500 file:text-white file:hover:bg-teal-600 transition-all duration-200"
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 mb-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back to Shipping Information
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                className="mb-4 text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg transition-all duration-200 ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-600'
              }`}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : step === 2 ? (
                'Confirm Payment'
              ) : (
                'Place Order'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;