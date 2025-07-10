import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { MoveRight } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/banners');
        setBanners(response.data);
      } catch (error) {
        console.error('Failed to fetch banners', error);
      }
    };
    fetchBanners();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  function CustomNextArrow(props) {
    const { onClick } = props;
    return (
      <motion.div
        className="absolute right-[-70px] top-1/2 -translate-y-1/2 cursor-pointer bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-full p-4 shadow-lg hover:bg-teal-500"
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </motion.div>
    );
  }

  function CustomPrevArrow(props) {
    const { onClick } = props;
    return (
      <motion.div
        className="absolute left-[-70px] top-1/2 -translate-y-1/2 cursor-pointer bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-full p-4 shadow-lg hover:bg-teal-500"
        onClick={onClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </motion.div>
    );
  }

  return (
    <div className="lg:container mx-auto px-4 py-8">
      <Slider {...settings}>
        {banners?.map((banner) => (
          <div key={banner?.id} className="relative h-[500px] md:h-[600px] rounded-xl overflow-hidden">
            <LazyLoadImage
              src={banner.image_url || 'https://images.unsplash.com/photo-1721332153282-3be0f390237c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'}
              alt={banner?.title}
              className="w-full h-full object-cover"
              effect="blur"
              placeholderSrc="https://placeholder.co/1920x600?text=Loading"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center justify-start p-8 md:p-16"
              variants={textVariants}
              initial="initial"
              animate="animate"
            >
              <div className="max-w-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-md p-6 rounded-lg">
                <motion.p
                  variants={textVariants}
                  className="text-sm font-medium text-gray-200 uppercase"
                >
                  {banner?.sub_title || 'New Arrival'}
                </motion.p>
                <motion.h3
                  variants={textVariants}
                  className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4"
                >
                  {banner?.title || 'Discover New Devices'}
                </motion.h3>
                <motion.button
                  className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-teal-600"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/products')}
                >
                  Shop Now <MoveRight size={20} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;