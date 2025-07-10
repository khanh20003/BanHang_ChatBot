import React, { useEffect, useState } from "react";
import axios from "axios";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "./UserSidebar";
import { Menu, X } from "lucide-react";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = authService.getCurrentUser();
      const token = user?.access_token;
      try {
        const res = await axios.get("http://127.0.0.1:8000/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex gap-8 flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-64">
          <UserSidebar />
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <UserSidebar />
              <button
                className="absolute top-4 right-4 text-gray-600 dark:text-gray-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20 p-8"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">Đơn Hàng Của Tôi</h2>
            <button
              className="lg:hidden text-gray-600 dark:text-gray-200"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-600 dark:text-gray-300 text-lg">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-700/50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Mã đơn hàng: #{order.id}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ngày đặt: {new Date(order.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Tổng tiền: {order.total_amount?.toLocaleString("vi-VN")}₫
                      </p>
                      <p className="text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Shipping"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status || "Đang xử lý"}
                        </span>
                      </p>
                    </div>
                    <button
                      className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-all duration-300 text-sm font-semibold"
                      onClick={() => navigate(`/orders/${order.id}/track`)}
                    >
                      Xem Chi Tiết
                    </button>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sản phẩm</h4>
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <img
                              src={
                                item.product.image
                                  ? item.product.image.startsWith('http')
                                    ? item.product.image
                                    : `http://127.0.0.1:8000/${item.product.image.replace(/^\/+/, '')}`
                                  : 'https://placeholder.co/50'
                              }
                              alt={item.product.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-1">{item.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {item.quantity} x {item.price?.toLocaleString("vi-VN")}₫
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default MyOrders;