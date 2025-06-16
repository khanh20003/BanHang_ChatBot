import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SectionTitle from "../SectionTitle/SectionTitle";
import { ShoppingCart, Eye } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useCart } from "../../context/CartContext";

const Product = () => {
    const [active, setActive] = useState({ id: 0, product: 'all' });
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const fallbackImg = '/fallback-product.png';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/products");
            setProducts(response.data);
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return fallbackImg;
        return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000/static/${imagePath}`;
    };

    const handleAddToCart = async (e, product) => {
        e.stopPropagation();
        try {
            await addToCart(product);
            toast.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            toast.error('Thêm vào giỏ hàng thất bại');
        }
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`);
    };

    const productTitle = [
        { id: 0, title: "Tất cả", product: "all" },
        { id: 1, title: "Mới nhất", product: "newest" },
        { id: 2, title: "Xu hướng", product: "trending" },
        { id: 3, title: "Bán chạy", product: "best_seller" }
    ];

    const filteredProducts = active.product === "all"
        ? products
        : products.filter(p => p.product_type === active.product);

    if (loading) {
        return (
            <div className="lg:container mx-auto min-h-[400px] flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-[#ff2c1d]"></div>
            </div>
        );
    }

    if (!products.length) {
        return (
            <div className="lg:container mx-auto">
                <div className="flex flex-col items-center justify-center">
                    <SectionTitle title="Sản phẩm" textAlign="center" mb="mb-5" />
                    <div className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Không có sản phẩm nào</h2>
                        <p className="text-gray-600">Chưa có sản phẩm trong hệ thống.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#f5f7fa] py-12 px-2 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <SectionTitle title="Sản phẩm nổi bật" textAlign="center" mb="mb-8" />
                <div className="flex flex-wrap justify-center gap-8 w-full">
                    {filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            onClick={() => handleProductClick(product.id)}
                            className="group bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative flex flex-col min-h-[420px] h-full max-w-[320px] w-full flex-1 border border-[#f1f1f1]"
                            style={{ minWidth: 260 }}
                        >
                            {/* Status badge */}
                            <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold z-10 ${product.status === 'Còn hàng' ? 'bg-[#ff2c1d] text-white' : 'bg-gray-400 text-white'}`}>
                                {product.status}
                            </span>
                            <div className="flex-1 flex items-center justify-center bg-[#f8f8fa] p-4">
                                <img
                                    className="w-auto h-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
                                    src={getImageUrl(product.image_url)}
                                    alt={product.title}
                                    onError={e => {
                                        if (e.target.src !== fallbackImg) e.target.src = fallbackImg;
                                    }}
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between p-5">
                                <h4 className="text-lg font-bold text-[#22223b] mb-2 line-clamp-2 min-h-[48px]">{product.title}</h4>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl font-extrabold text-[#ff2c1d]">${product.price}</span>
                                    {product.current_price && (
                                        <span className="text-base text-[#9a9caa] line-through">${product.current_price}</span>
                                    )}
                                </div>
                                <button
                                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#ff2c1d] text-white font-bold shadow hover:bg-[#ff5e3a] transition-all text-base mt-2"
                                    onClick={e => handleAddToCart(e, product)}
                                >
                                    <ShoppingCart size='1.2rem' /> Mua ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Product;
