import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, payment } = location.state || {};

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <CheckCircle size={64} className="text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-green-700">
        ORDER SUCCESSSUCCESS!
      </h1>
      <p className="mb-6 text-gray-700 text-lg">
        Thank you for shopping at our store. Your order has been placed successfully.
      </p>
      {order && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-2">Order information</h2>
          <div className="mb-2">
            <span className="font-medium">Order code:</span> #{order.id}
          </div>
          <div className="mb-2">
            <span className="font-medium">Recipient name:</span>{" "}
            {order.shipping_name}
          </div>
          <div className="mb-2">
            <span className="font-medium">Phone number:</span>{" "}
            {order.shipping_phone}
          </div>
          <div className="mb-2">
            <span className="font-medium">Delivery address:</span>{" "}
            {order.shipping_address}
          </div>
          <div className="mb-2">
            <span className="font-medium">Total amount:</span>{" "}
            {order.total_amount?.toLocaleString("vi-VN")}
            đ
          </div>
          <div className="mb-2">
            <span className="font-medium">Payment method:</span>{" "}
            {order.payment_method === "cod"
              ? "Cash on Delivery"
              : "Bank transfer"}
          </div>
          <div className="mb-2">
            <span className="font-medium">Payment status:</span>{" "}
            {order.payment_status === "pending"
              ? "Wait for payment"
              : "Paid"}
          </div>
        </div>
      )}
      <button
        onClick={() => navigate("/products")}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Continue shopping
      </button>
    </div>
  );
};

export default OrderSuccess;
