import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placeholder.co/600x400";
    return imagePath.startsWith("http") ? imagePath : `http://127.0.0.1:8000/static/${imagePath}`;
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    try {
      await addToCart(product);
      toast.success("Product added to cart");
    } catch (error) {
      toast.error("Failed to add product to cart");
    }
  };

  const handleAddToWishlist = (e, product) => {
    e.stopPropagation();
    addToWishlist(product);
    // Có thể thêm toast nếu muốn
    // toast.success("Added to wishlist");
  };

  const openLightbox = () => setShowLightbox(true);
  const closeLightbox = () => setShowLightbox(false);
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto min-h-screen flex items-center justify-center">
        <h2 className="text-3xl font-semibold text-red-600">Product not found</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
        {/* Product Image */}
        <div className="relative group space-y-8 p-6 overflow-hidden rounded-2xl shadow-xl bg-white">
          <img
            src={getImageUrl(product.image)}
            alt={product.title}
            className="w-full h-[auto] object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <button
            onClick={openLightbox}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
          >
            <svg
              className="w-14 h-14 text-white drop-shadow-lg"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </button>
        </div>

        {/* Product Info */}
        <div className="space-y-8 p-6 bg-white rounded-2xl shadow-lg">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {product.title}
          </h1>

          <div className="flex items-center gap-6">
            <span className="text-3xl font-bold text-indigo-600">
                      {(product.currentPrice || product.price)?.toLocaleString('vi-VN')}₫
            </span>
            {product.currentPrice && (
              <span className="text-gray-500 line-through ml-2">
                  {product.price?.toLocaleString('vi-VN')}₫
              </span>
            )}
            {product.status && (
              <span className="inline-block bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse">
                {product.status}
              </span>
            )}
          </div>

          {/* Product Actions */}
          <div className="flex gap-4">
            <button
              onClick={(e) => handleAddToCart(e, product)}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
            <button
              onClick={(e) => handleAddToWishlist(e, product)}
              className="flex items-center gap-2 px-8 py-3 border border-indigo-600 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1"
            >
              <Heart className="w-5 h-5" />
              Add to Wishlist
            </button>
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Product Details
            </h3>
            <ul className="space-y-3 text-gray-600 text-lg">
              <li>
                <strong>Category:</strong> {product.short_description}
              </li>
              <li>
                <strong>Availability:</strong>{" "}
                {product.stock > 0 ? (
                  <span className="text-emerald-600">In Stock</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </li>
              <li>
                <strong>SKU:</strong> #{product.id}
              </li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl shadow-inner">
            <h4 className="text-xl font-semibold text-gray-800 mb-3">
              Need Assistance?
            </h4>
            <p className="text-gray-600 mb-4">
              Connect with our support team for personalized product insights and exclusive offers.
            </p>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-300 shadow-md hover:shadow-lg">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in"
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={getImageUrl(product.image)}
              alt="Zoomed"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-500 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;