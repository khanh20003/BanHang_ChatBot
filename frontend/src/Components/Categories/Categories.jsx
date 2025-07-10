import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8000/categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Lỗi lấy categories:', err));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  const getImageUrl = (imagePath) =>
    imagePath?.startsWith('http') ? imagePath : `http://localhost:8000${imagePath}`;

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  function CustomNextArrow(props) {
    const { onClick } = props;
    return (
      <motion.div
        className="absolute right-[-40px] top-1/2 -translate-y-1/2 cursor-pointer bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-teal-500"
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight size={24} className="text-teal-500 dark:text-teal-400" />
      </motion.div>
    );
  }

  function CustomPrevArrow(props) {
    const { onClick } = props;
    return (
      <motion.div
        className="absolute left-[-40px] top-1/2 -translate-y-1/2 cursor-pointer bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-teal-500"
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft size={24} className="text-teal-500 dark:text-teal-400" />
      </motion.div>
    );
  }

  return (
    <div className="lg:container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center mb-12"
      >
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
        Top Categories
                </h2>
      </motion.div>
      <Slider {...settings}>
        {categories.map((category) => (
          <motion.div
            key={category.id}
            className="p-4"
            variants={cardVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <Link to={`/category/${category.id}`} className="block">
              <div className="relative bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-md overflow-hidden">
                <LazyLoadImage
                  className="w-full h-80 object-cover"
                  src={getImageUrl(category.image)}
                  alt={category.title || 'Category'}
                  effect="blur"
                  placeholderSrc="https://placeholder.co/400x200?text=Loading"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black/60 p-4 text-white backdrop-blur-sm">
                  <h4 className="text-lg font-semibold capitalize">{category.name}</h4>
                  <p className="text-sm capitalize">
                    {category.products ? `${category.products} sản phẩm` : 'Chưa có sản phẩm'}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </Slider>
    </div>
  );
};

export default Categories;