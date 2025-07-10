import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Package, Lock } from "lucide-react";

const UserSidebar = () => {
  const navItems = [
    { path: "/profile", label: "Hồ Sơ", icon: User },
    { path: "/my-orders", label: "Đơn Hàng", icon: Package },
    { path: "/change-password", label: "Đổi Mật Khẩu", icon: Lock },
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl p-6 h-fit fixed top-auto lg:left-auto z-50"
      style={{ minWidth: "16rem", maxHeight: "calc(100vh - 8rem)" }}
    >
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Tài Khoản</h3>
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-teal-500 text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-teal-100 dark:hover:bg-teal-900/50"
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
};

export default UserSidebar;