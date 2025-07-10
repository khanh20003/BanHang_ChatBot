import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Facebook, Instagram, Twitter } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Giả lập gửi form (thay bằng API thực tế)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12 transition-colors duration-300">
      {/* Banner */}
      <div className="relative w-full h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://martech.com.vn/pictures/catalog/tintuc/technical/contact-us-banner.jpg)' }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.h1
            className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact Us
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-8"
        >
          <motion.p
            variants={itemVariants}
            className="text-center text-gray-700 dark:text-gray-300 text-lg mb-8"
          >
            We’re here to help! Reach out to us via the form below, or connect through our contact details and social media.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Name
                  </label>
                  <motion.input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                    placeholder="Your full name"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <motion.input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                    placeholder="Your email address"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                    Message
                  </label>
                  <motion.textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                    placeholder="How can we assist you?"
                    rows="4"
                    required
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-600'
                  }`}
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                >
                  {loading ? (
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
                  ) : (
                    <>
                      <Send size={18} />
                      Send Message
                    </>
                  )}
                </motion.button>
                {success && (
                  <motion.p
                    className="mt-4 text-teal-500 dark:text-teal-400 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                  
                    Message sent successfully!
                  </motion.p>
                )}
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                Contact Information
              </h2>
              <ul className="space-y-4">
                <motion.li
                  variants={itemVariants}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <Mail className="text-teal-500" size={20} />
                  <a href="mailto:buitranbaolocbui@gmail.com" className="hover:text-teal-500 transition-colors duration-200">
                    buitrambaolocbui@gmail.com
                  </a>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <Phone className="text-teal-500" size={20} />
                  <a href="tel:0838610344" className="hover:text-teal-500 transition-colors duration-200">
                    0838 610 344
                  </a>
                </motion.li>
                <motion.li
                  variants={itemVariants}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <MapPin className="text-teal-500" size={20} />
                  <span>123 Tran Hung Dao, Vinh Long, Vietnam</span>
                </motion.li>
              </ul>
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <motion.a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors duration-200"
                    whileHover={{ scale: 1.2 }}
                  >
                    <Facebook size={24} />
                  </motion.a>
                  <motion.a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors duration-200"
                    whileHover={{ scale: 1.2 }}
                  >
                    <Instagram size={24} />
                  </motion.a>
                  <motion.a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-teal-500 transition-colors duration-200"
                    whileHover={{ scale: 1.2 }}
                  >
                    <Twitter size={24} />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;