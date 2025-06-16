import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

const Cart = () => {
    const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart();
    const [discountCode, setDiscountCode] = useState('');
    const [applyingDiscount, setApplyingDiscount] = useState(false);
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="lg:container mx-auto min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-[#029fae]"></div>
            </div>
        );
    }

    if (!cart || !cart.cart.items.length) {
        return (
            <div className="lg:container mx-auto min-h-screen py-12">
                <div className="text-center">
                    <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
                    <Link to="/" className="btn bg-[#029fae] text-white hover:bg-[#007580]">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        setApplyingDiscount(true);
        // TODO: Implement discount code logic
        setTimeout(() => {
            setApplyingDiscount(false);
            setDiscountCode('');
        }, 1000);
    };

    return (
        <div className="lg:container mx-auto py-12">
            <h1 className="text-3xl font-bold text-[#272343] mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm">
                        {cart.cart.items.map((item) => (
                            <div key={item.id} className="p-6 border-b last:border-b-0">
                                <div className="flex gap-6">
                                    {/* Product Image */}
                                    <div className="w-24 h-24 flex-shrink-0">
                                        <img
                                            src={item.product.image.startsWith('http') 
                                                ? item.product.image 
                                                : `http://127.0.0.1:8000/static/${item.product.image}`}
                                            alt={item.product.title}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-grow">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-[#272343]">
                                                    {item.product.title}
                                                </h3>
                                                <p className="text-[#029fae] font-semibold mt-1">
                                                    ${item.price}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-4 mt-4">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="btn btn-sm btn-circle btn-outline"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="btn btn-sm btn-circle btn-outline"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Clear Cart Button */}
                    <button
                        onClick={clearCart}
                        className="mt-4 text-red-500 hover:text-red-600 flex items-center gap-2"
                    >
                        <Trash2 size={20} />
                        Clear Cart
                    </button>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-[#272343] mb-6">Order Summary</h2>

                        {/* Discount Code */}
                        <div className="mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter discount code"
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    className="flex-grow input input-bordered"
                                />
                                <button
                                    onClick={handleApplyDiscount}
                                    disabled={applyingDiscount || !discountCode.trim()}
                                    className="btn bg-[#029fae] text-white hover:bg-[#007580]"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>${cart.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (10%)</span>
                                <span>${cart.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>{cart.shipping === 0 ? 'Free' : `$${cart.shipping.toFixed(2)}`}</span>
                            </div>
                            {cart.discount && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-${cart.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-4 flex justify-between text-lg font-semibold text-[#272343]">
                                <span>Total</span>
                                <span>${cart.total.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <button 
                            onClick={() => {
                                if (!cart.cart.items.length) {
                                    alert('Your cart is empty');
                                    return;
                                }
                                try {
                                    navigate('/checkout');
                                } catch (error) {
                                    console.error('Navigation error:', error);
                                    alert('There was an error proceeding to checkout. Please try again.');
                                }
                            }} 
                            className="btn btn-block bg-[#029fae] text-white hover:bg-[#007580] mt-6"
                        >
                            Proceed to Checkout
                        </button>

                        {/* Continue Shopping */}
                        <Link
                            to="/"
                            className="btn btn-block btn-outline border-[#029fae] text-[#029fae] hover:bg-[#029fae] hover:text-white mt-4"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart; 