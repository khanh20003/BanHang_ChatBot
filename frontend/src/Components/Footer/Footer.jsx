import { Smartphone, Banknote, CreditCard, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const containerVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const itemVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <footer className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md">
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="footer_top max-h-[343px] w-full border-t border-b border-gray-200 dark:border-gray-700 pt-[80px] pb-[60px]"
            >
                <div className="lg:container mx-auto">
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
                    >
                        <motion.div variants={itemVariants}>
                            <div className="logo_wrapper mb-7">
                                <Link to="/" className="text-3xl text-gray-800 dark:text-white font-inter font-medium capitalize flex items-center gap-2">
                                    <Smartphone size="2rem" color="#029fae" />
                                    Device
                                </Link>
                            </div>
                            <p className="text-base text-gray-600 dark:text-gray-300 font-inter font-normal mb-4 max-w-[350px]">
                                Trải nghiệm dòng thiết bị điện tử mới nhất, được chế tác bằng công nghệ tiên tiến và độ chính xác cao. Hiệu suất mạnh mẽ, vận hành ổn định, giúp bạn đơn giản hóa mọi tác vụ trong cuộc sống.
                            </p>
                            <motion.div variants={itemVariants} className="footer_social flex items-center gap-3">
                                <Link className="p-3 rounded-full border-teal-500 dark:border-teal-400 inline-block border-[1px] hover:bg-teal-500 hover:text-white transition-colors duration-200">
                                    <Facebook size="1.5rem" color="#007580" />
                                </Link>
                                <Link className="p-3 inline-block hover:bg-teal-500 hover:text-white rounded-full transition-colors duration-200">
                                    <Twitter size="1.5rem" color="#007580" />
                                </Link>
                                <Link className="p-3 inline-block hover:bg-teal-500 hover:text-white rounded-full transition-colors duration-200">
                                    <Instagram size="1.5rem" color="#007580" />
                                </Link>
                                <Link className="p-3 inline-block hover:bg-teal-500 hover:text-white rounded-full transition-colors duration-200">
                                    <Youtube size="1.5rem" color="#007580" />
                                </Link>
                            </motion.div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="footer_wrapper">
                            <h3 className="text-xl text-gray-400 dark:text-gray-500 font-inter font-medium uppercase">Category</h3>
                            <ul className="space-y-2 mt-4">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <Link to={`/category/${category.id}`} className="text-base text-gray-600 dark:text-gray-300 font-inter font-normal capitalize hover:text-teal-500 transition-colors duration-200">
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div variants={itemVariants} className="footer_wrapper">
                            <h3 className="text-xl text-gray-400 dark:text-gray-500 font-inter font-medium uppercase">Support</h3>
                            <ul className="space-y-2 mt-4">
                                <li><Link className="text-base text-gray-600 dark:text-gray-300 font-inter font-normal capitalize hover:text-teal-500 transition-colors duration-200">Giới thiệu</Link></li>
                                <li><Link className="text-base text-gray-600 dark:text-gray-300 font-inter font-normal capitalize hover:text-teal-500 transition-colors duration-200">Liên hệ</Link></li>
                            </ul>
                        </motion.div>

                        <motion.div variants={itemVariants} className="newsletter">
                            <h3 className="text-xl text-gray-400 dark:text-gray-500 font-inter font-medium uppercase">Newsletter</h3>
                            <form action="#" className="max-w-[424px] w-full flex items-center gap-2 mt-4">
                                <input
                                    type="email"
                                    placeholder="Your Email.."
                                    className="max-w-[285px] w-full h-[46px] border-gray-200 dark:border-gray-700 rounded-lg pl-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                                />
                                <button
                                    type="submit"
                                    className="text-base text-white font-semibold capitalize w-[127px] h-[46px] bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg hover:bg-teal-600 transition-colors duration-200"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                className="footer_bottom w-full h-[75px] flex items-center justify-center bg-white/30 dark:bg-gray-800/30 backdrop-blur-md"
            >
                <div className="lg:container mx-auto">
                    <motion.div variants={itemVariants} className="flex items-center justify-between w-full">
                        <p className="text-base text-gray-400 dark:text-gray-500 font-normal font-inter">
                            @ 2025 Blogy- Designed & Developed <span className="text-gray-600 dark:text-gray-300">Lifeonthecode</span>
                        </p>
                        <motion.div variants={itemVariants} className="flex items-center gap-3.5">
                            <p className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xl hover:text-teal-500 transition-colors duration-200">
                                Bank Note <Banknote size="2rem" />
                            </p>
                            <p className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xl hover:text-teal-500 transition-colors duration-200">
                                Credit Card <CreditCard size="2rem" />
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </footer>
    );
};

export default Footer;