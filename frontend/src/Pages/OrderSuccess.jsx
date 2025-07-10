import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Package, Truck, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, payment } = location.state || {};

  // Confetti effect khi tải trang
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#14b8a6', '#3b82f6', '#22c55e'],
    });
  }, []);

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  const handleShare = () => {
    const shareText = `I just placed an order #${order?.id} at Your E-Commerce! Check out their awesome products!`;
    if (navigator.share) {
      navigator.share({
        title: 'Order Confirmation',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Order details copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 transition-colors duration-300">
      {/* Banner */}
      <div className="relative w-full h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1721332153282-3be0f390237c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.h1
            className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Order Confirmed!
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="text-center mb-8"
        >
          <motion.div variants={itemVariants}>
            <CheckCircle size={64} className="text-teal-500 mx-auto mb-4" />
          </motion.div>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-semibold text-gray-800 dark:text-white mb-4"
          >
            Thank You, {order?.shipping_name || 'Customer'}!
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-600 dark:text-gray-300 text-lg mb-6"
          >
            Your order has been placed successfully. We’re preparing your items and will notify you soon!
          </motion.p>
        </motion.div>

        {/* Order Information */}
        {order && (
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8"
          >
            <motion.h3
              variants={itemVariants}
              className="text-xl font-semibold text-gray-800 dark:text-white mb-4"
            >
              Order Details
            </motion.h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Order Code:</span> #{order.id}
              </motion.div>
              <motion.div variants={itemVariants} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Recipient Name:</span> {order.shipping_name}
              </motion.div>
              <motion.div variants={itemVariants} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Phone Number:</span> {order.shipping_phone}
              </motion.div>
              <motion.div variants={itemVariants} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Delivery Address:</span> {order.shipping_address}
              </motion.div>
              <motion.div variants={itemVariants} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Total Amount:</span> {order.total_amount?.toLocaleString('vi-VN')}₫
              </motion.div>
              <motion.div variants={itemVariants} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Payment Method:</span>{' '}
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
              </motion.div>
              <motion.div variants={itemVariants} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Payment Status:</span>{' '}
                {order.payment_status === 'pending' ? (
                  <span className="text-yellow-500">Waiting for Payment</span>
                ) : (
                  <span className="text-green-500">Paid</span>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* What's Next Timeline */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8"
        >
          <motion.h3
            variants={itemVariants}
            className="text-xl font-semibold text-gray-800 dark:text-white mb-4"
          >
            What’s Next?
          </motion.h3>
          <div className="space-y-4">
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4"
            >
              <Package className="text-teal-500" size={24} />
              <div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-white">Order Processing</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We’re preparing your order. Estimated processing time: 1-2 days.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4"
            >
              <Truck className="text-teal-500" size={24} />
              <div>
                <h4 className="text-lg font-medium text-gray-800 dark:text-white">Shipping</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your order will be shipped within 3-5 business days. Track it online!
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:bg-teal-600 transition-all duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.button>
          <motion.button
            variants={itemVariants}
            onClick={() => navigate(`/orders/${order?.id}/track`)}
            className="bg-white dark:bg-gray-800 border border-teal-500 text-teal-500 py-3 px-6 rounded-lg hover:bg-teal-500 hover:text-white transition-all duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Track Your Order
          </motion.button>
          <motion.button
            variants={itemVariants}
            onClick={handleShare}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={18} />
            Share Order
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;