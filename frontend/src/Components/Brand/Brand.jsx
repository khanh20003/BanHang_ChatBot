import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Brand = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/brands/');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands', error);
    }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <div className="lg:container mx-auto px-4 py-12">
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      >
        {brands?.map((brand) => (
          <motion.div
            key={brand.id}
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-lg shadow-md p-4 flex items-center justify-center"
            variants={cardVariants}
            whileHover="hover"
          >
            <LazyLoadImage
              src={brand.logo || 'https://placeholder.co/100?text=Brand'}
              alt={`brand-${brand.id}`}
              className="w-auto h-16 object-contain"
              effect="blur"
              placeholderSrc="https://placeholder.co/100?text=Loading"
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Brand;