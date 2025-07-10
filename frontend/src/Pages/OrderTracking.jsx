import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import authService from "../services/authService";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Package, Truck, Clock, MapPin, User, Phone } from "lucide-react";

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const user = authService.getCurrentUser();
        const token = user?.access_token;
        const res = await axios.get(
          `http://127.0.0.1:8000/orders/${id}`,
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : undefined
        );
        setOrder(res.data);
      } catch (err) {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Giả lập trạng thái timeline (có thể thay bằng dữ liệu từ backend)
  const timelineSteps = [
    { status: "Order Placed", date: order?.created_at || "2025-06-27", completed: true, icon: CheckCircle },
    { status: "Processing", date: order?.processing_at || "2025-06-27", completed: order?.status !== "Order Placed", icon: Package },
    { status: "Shipping", date: order?.shipping_at || "Pending", completed: order?.status === "Shipping" || order?.status === "Delivered", icon: Truck },
    { status: "Delivered", date: order?.delivered_at || "Pending", completed: order?.status === "Delivered", icon: MapPin },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center text-gray-600 dark:text-gray-300 text-lg">
        Đang tải...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-16 text-center text-red-500 text-lg">
        Không tìm thấy đơn hàng.
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-3xl font-bold">Theo Dõi Đơn Hàng #{order.id}</h2>
          <p className="text-base mt-1">Trạng thái: <span className="font-semibold">{order.status || "Đang xử lý"}</span></p>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-8">
          {/* Timeline */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tiến Trình Đơn Hàng</h3>
            <div className="relative">
              {timelineSteps.map((step, index) => (
                <div key={index} className="flex items-start mb-6">
                  {/* Icon & Line */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? "bg-orange-500 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <step.icon size={20} />
                    </motion.div>
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`w-1 h-12 mx-auto mt-2 ${
                          step.completed ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-600"
                        }`}
                      ></div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{step.status}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Info */}
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Thông Tin Giao Hàng</h3>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <User size={18} className="text-orange-500" />
                  <span><b>Người nhận:</b> {order.shipping_name}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
                  <span><b>Địa chỉ:</b> {order.shipping_address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={18} className="text-orange-500" />
                  <span><b>Số điện thoại:</b> {order.shipping_phone}</span>
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Tóm Tắt Đơn Hàng</h3>
              <div className="space-y-3">
                <p><b>Mã đơn hàng:</b> #{order.id}</p>
                <p><b>Tổng tiền:</b> {order.total_amount?.toLocaleString("vi-VN")}₫</p>
                {order.items && order.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Sản phẩm</h4>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-3 mb-3">
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
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderTracking;