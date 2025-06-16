import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { order, payment } = location.state || {};

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Order not found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-600">Thank you for your purchase</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order Number:</span>
                            <span className="font-medium">#{order.id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Order Date:</span>
                            <span className="font-medium">
                                {new Date(order.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-medium">
                                ${order.total_amount.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Payment Method:</span>
                            <span className="font-medium capitalize">
                                {order.payment_method}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Payment Status:</span>
                            <span className="font-medium capitalize">
                                {payment.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {order.shipping_name}</p>
                        <p><strong>Phone:</strong> {order.shipping_phone}</p>
                        <p><strong>Address:</strong> {order.shipping_address}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">{item.product.title}</h3>
                                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <p className="font-medium">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess; 