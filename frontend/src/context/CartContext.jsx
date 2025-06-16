import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import API_URL from '../config/api';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionId, setSessionId] = useState(() => {
        // Get session ID from localStorage or create new one
        const savedSessionId = localStorage.getItem('cartSessionId');
        if (savedSessionId) return savedSessionId;
        const newSessionId = crypto.randomUUID();
        localStorage.setItem('cartSessionId', newSessionId);
        return newSessionId;
    });

    // Fetch cart data
    const fetchCart = async () => {
        try {
            const response = await axios.get(`${API_URL}/cart/${sessionId}`);
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    };

    // Add item to cart
    const addToCart = async (product, quantity = 1) => {
        try {
            const response = await axios.post(`${API_URL}/cart/${sessionId}/items`, {
                product_id: product.id,
                quantity: quantity,
                price: product.price
            });
            setCart(response.data);
            toast.success('Added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId, quantity) => {
        if (quantity < 1) return;
        try {
            const response = await axios.put(
                `${API_URL}/cart/${sessionId}/items/${itemId}?quantity=${quantity}`
            );
            setCart(response.data);
            toast.success('Cart updated');
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        try {
            const response = await axios.delete(
                `${API_URL}/cart/${sessionId}/items/${itemId}`
            );
            setCart(response.data);
            toast.success('Item removed from cart');
        } catch (error) {
            console.error('Error removing from cart:', error);
            toast.error('Failed to remove item');
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            await axios.delete(`${API_URL}/cart/${sessionId}`);
            setCart(null);
            toast.success('Cart cleared');
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        }
    };

    // Load cart on mount
    useEffect(() => {
        fetchCart();
    }, [sessionId]);

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}; 