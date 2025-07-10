import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Truck } from 'lucide-react';

const About = () => {
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };

  const itemVariants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const teamMembers = [
    {
      name: 'Bui Tran Bao Loc',
      role: 'Founder & CEO',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg/960px-Official_Presidential_Portrait_of_President_Donald_J._Trump_%282025%29.jpg',
    },
    {
      name: 'Tran Hoang Phuc',
      role: 'Head of Marketing',
      image: 'https://nghiencuuquocte.org/wp-content/uploads/2017/01/30.jpg',
    },
    {
      name: 'Tran Duy Khanh ',
      role: 'Lead Developer',
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Kim_Jong-un_April_2019_%28cropped%29.jpg/960px-Kim_Jong-un_April_2019_%28cropped%29.jpg',
    },
  ];

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-12 transition-colors duration-300">
      {/* Banner */}
      <div className="relative w-full h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://wewin.com.vn/wp-content/uploads/2022/12/toi-uu-about-us-tren-website-2.jpg)' }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <motion.h1
            className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About Us
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-8 mb-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 text-center"
          >
            Our Story
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-gray-700 dark:text-gray-300 text-lg mb-6 text-center"
          >
            Founded in 2020, our e-commerce platform is dedicated to delivering high-quality products with competitive prices and exceptional customer service. Our mission is to make online shopping seamless, enjoyable, and accessible for everyone.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-gray-700 dark:text-gray-300 text-lg mb-6 text-center"
          >
            With a diverse range of thousands of products, from electronics to fashion, we strive to meet the needs of every customer. Our team is passionate about innovation and customer satisfaction, earning us trust and high ratings from our community.
          </motion.p>
        </motion.div>

        {/* Our Values */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-8 mb-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center"
          >
            Our Core Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              variants={itemVariants}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="text-teal-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Customer First
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We prioritize your satisfaction with personalized support and quality products.
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Award className="text-teal-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Excellence
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We strive for excellence in every product and service we offer.
              </p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Truck className="text-teal-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Reliability
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Fast, secure, and dependable delivery to your doorstep.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Our Team */}
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md rounded-xl shadow-lg p-8"
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 text-center"
          >
            Meet Our Team
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-md"
                />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;