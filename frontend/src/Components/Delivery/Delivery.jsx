import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, Percent, ShieldCheck, Truck } from 'lucide-react';

const Delivery = () => {
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const benefits = [
    {
      icon: <Percent size={48} className="text-teal-500" />,
      title: 'Discount',
      description: 'Every Week New Sales',
    },
    {
      icon: <Truck size={48} className="text-teal-500" />,
      title: 'Free Delivery',
      description: '100% Free for All Orders',
    },
    {
      icon: <Clock3 size={48} className="text-teal-500" />,
      title: 'Great Support 24/7',
      description: 'We Care About Your Experience',
    },
    {
      icon: <ShieldCheck size={48} className="text-teal-500" />,
      title: 'Secure Payment',
      description: '100% Secure Payment Method',
    },
  ];

  return (
    <div className="lg:container mx-auto px-4 py-12">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      >
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-md p-6 flex items-center gap-4"
            variants={cardVariants}
            whileHover="hover"
          >
            {benefit.icon}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {benefit.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Delivery;