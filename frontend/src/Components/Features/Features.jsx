import { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import SectionTitle from "../SectionTitle/SectionTitle";
import { ShoppingCart } from "lucide-react";
import { motion } from 'framer-motion';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Features = () => {
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/features");
                setFeatures(response.data);
            } catch (error) {
                console.error("Failed to fetch features", error);
            }
        };
        fetchFeatures();
    }, []);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } },
        ],
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
    };

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        hover: { scale: 1.05, boxShadow: "0 10px 20px rgba(0, 128, 128, 0.3)", transition: { duration: 0.3 } },
    };

    function CustomNextArrow(props) {
        const { onClick } = props;
        return (
            <motion.div
                className="absolute right-[-50px] top-1/2 -translate-y-1/2 cursor-pointer bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-full p-3 shadow-xl hover:from-teal-600 hover:to-blue-700"
                onClick={onClick}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </motion.div>
        );
    }

    function CustomPrevArrow(props) {
        const { onClick } = props;
        return (
            <motion.div
                className="absolute left-[-50px] top-1/2 -translate-y-1/2 cursor-pointer bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-full p-3 shadow-xl hover:from-teal-600 hover:to-blue-700"
                onClick={onClick}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </motion.div>
        );
    }

    return (
        <div className="lg:container mx-auto px-4 py-12 bg-gradient-to-br from-teal-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-900/50 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center mb-12"
            >
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
                Featured Products
            </h2>    
            </motion.div>    
            <motion.div
                className="slider-container features_slider w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Slider {...settings}>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="p-4"
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                        >
                            <div className="feature_image mb-6 relative bg-gradient-to-br from-teal-100/50 to-blue-100/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl overflow-hidden shadow-lg">
                                <LazyLoadImage
                                    src={feature.image_url || 'https://placeholder.co/300x300?text=No+Image'}
                                    alt={feature.title}
                                    className="w-full h-72 object-cover transition-opacity duration-300"
                                    effect="blur"
                                    placeholder={<div className="w-full h-72 bg-gradient-to-br from-teal-200 to-blue-200 animate-pulse" />}
                                />
                                {feature.status && (
                                    <motion.div
                                        className="absolute top-4 right-4 bg-teal-600 text-white px-3 py-1.5 rounded-full shadow-md"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <span className="text-base font-semibold font-inter">{feature.status}</span>
                                    </motion.div>
                                )}
                            </div>
                            
                        </motion.div>
                    ))}
                </Slider>
            </motion.div>
        </div>
    );
};

export default Features;