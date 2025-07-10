import SectionTitle from "../SectionTitle/SectionTitle";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { motion } from 'framer-motion';
import { User } from "lucide-react";

const Client = () => {
    const clientSays = [
        {
            id: 1,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna, sit amet eget...',
            name: 'John Doe',
            position: 'CEO, Company',
        },
        {
            id: 2,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna, sit amet eget...',
            name: 'Jane Smith',
            position: 'CTO, TechCorp',
        },
        {
            id: 3,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna, sit amet eget...',
            name: 'Mike Johnson',
            position: 'Manager, Innovate',
        },
        {
            id: 4,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In urna, sit amet eget...',
            name: 'Sarah Lee',
            position: 'Director, FutureTech',
        },
    ];

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        responsive: [
            { breakpoint: 640, settings: { slidesToShow: 1 } },
        ],
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
    };

    const cardVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        hover: { scale: 1.02, transition: { duration: 0.2 } },
    };

    function CustomNextArrow(props) {
        const { onClick } = props;
        return (
            <motion.div
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 cursor-pointer bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-teal-500"
                onClick={onClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </motion.div>
        );
    }

    function CustomPrevArrow(props) {
        const { onClick } = props;
        return (
            <motion.div
                className="absolute left-[-20px] top-1/2 -translate-y-1/2 cursor-pointer bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-full p-2 shadow-lg hover:bg-teal-500"
                onClick={onClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </motion.div>
        );
    }

    return (
        <div className="lg:container mx-auto px-4 py-12">
            <SectionTitle title="What Clients Say About Us" mb="mb-11" />
            <motion.div
                className="slider-container w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Slider {...settings}>
                    {clientSays.map((client) => (
                        <motion.div
                            key={client.id}
                            className="p-6 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
                            variants={cardVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                        >
                            <p className="text-lg text-gray-600 dark:text-gray-300 font-inter font-normal mb-4 line-clamp-3">
                                {client.description}
                            </p>
                            <div className="flex items-center gap-4">
                                <User size="4rem" className="text-teal-500" />
                                <div>
                                    <h4 className="text-xl text-gray-800 dark:text-white font-inter font-medium capitalize mb-1.5">
                                        {client.name}
                                    </h4>
                                    <p className="text-base text-gray-400 dark:text-gray-500 font-inter capitalize font-normal">
                                        {client.position}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </Slider>
            </motion.div>
        </div>
    );
};

export default Client;