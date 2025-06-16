import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShoppingBag } from 'lucide-react';
import SectionTitle from '../../Components/SectionTitle/SectionTitle';
import authService from '../../services/authService';
import API_URL from '../../config/api';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const [formData, setFormData] = useState({
        shipping_name: '',
        shipping_phone: '',
        shipping_address: '',
        payment_method: 'cod' // Default to Cash on Delivery
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Get session ID from localStorage or generate new one
            const sessionId = localStorage.getItem('cartSessionId') || Date.now().toString();
            localStorage.setItem('cartSessionId', sessionId);

            // Get auth token
            const user = authService.getCurrentUser();
            if (!user || !user.access_token) {
                navigate('/auth/login');
                toast.error('Please login to place an order');
                return;
            }

            // Create order
            const response = await axios.post(
                `${API_URL}/checkout/`,
                {
                    ...formData,
                    items: cart.cart.items.map(item => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                },
                {
                    headers: {
                        'Authorization': `Bearer ${user.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            // Clear cart after successful order
            clearCart();
            
            // Redirect to success page with order and payment info
            navigate('/order-success', { 
                state: { 
                    order: response.data.order,
                    payment: response.data.payment
                } 
            });
        } catch (err) {
            console.error('Error creating order:', err);
            if (err.response?.status === 401) {
                // Token expired or invalid
                authService.logout();
                window.location.reload();
            } else if (err.response?.data?.detail) {
                // Handle validation errors
                if (Array.isArray(err.response.data.detail)) {
                    const errorMessages = err.response.data.detail.map(error => error.msg).join(', ');
                    setError(errorMessages);
                } else {
                    setError(err.response.data.detail);
                }
            } else {
                setError('Failed to create order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!cart || !cart.cart || !cart.cart.items || cart.cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    {cart.cart.items.map((item) => (
                        <div key={item.id} className="flex justify-between mb-4">
                            <div>
                                <h3 className="font-medium">{item.product.title}</h3>
                                <p className="text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-medium">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                    ))}
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between mb-2">
                            <span>Subtotal:</span>
                            <span>{cart.subtotal.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Tax (10%):</span>
                            <span>{cart.tax.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span>Shipping:</span>
                            <span>{cart.shipping.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg mt-4">
                            <span>Total:</span>
                            <span>{cart.total.toLocaleString('vi-VN')}đ</span>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="shipping_name">
                                Full Name
                            </label>
                            <input
                                type="text"
                                id="shipping_name"
                                name="shipping_name"
                                value={formData.shipping_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="shipping_phone">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="shipping_phone"
                                name="shipping_phone"
                                value={formData.shipping_phone}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2" htmlFor="shipping_address">
                                Shipping Address
                            </label>
                            <textarea
                                id="shipping_address"
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 mb-2">Payment Method</label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="cod"
                                        checked={formData.payment_method === 'cod'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    Cash on Delivery
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="bank_transfer"
                                        checked={formData.payment_method === 'bank_transfer'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    Bank Transfer
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-4 text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;