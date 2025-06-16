import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import { ShoppingCart, Heart } from "lucide-react";

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000/static/${imagePath}`;
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
            <div className="lg:container mx-auto min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg text-[#029fae]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="lg:container mx-auto min-h-screen flex items-center justify-center">
                <h2 className="text-2xl text-red-500">Product not found</h2>
            </div>
        );
    }

    return (
        <div className="lg:container mx-auto py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="product-image">
                    <img 
                        src={getImageUrl(product.image)} 
                        alt={product.title} 
                        className="w-full h-[auto] object-cover rounded-lg"
                    />
                </div>

                {/* Product Info */}
                <div className="product-info space-y-6">
                    <h1 className="text-4xl font-bold text-[#272343]">{product.title}</h1>
                    <p className="text-2xl text-[#029fae] font-semibold">
                        ${product.currentPrice}
                        {product.currentPrice && (
                            <span className="ml-2 text-lg text-[#9a9caa] line-through">${product.price}</span>
                        )}
                    </p>
                    {product.status && (
                        <div className="inline-block bg-[#007580] text-white px-3 py-1 rounded text-sm">
                            {product.status}
                        </div>
                    )}

                    {/* Product Actions */}
                    <div className="flex gap-4">
                        <button className="btn bg-[#029fae] text-white hover:bg-[#007580] flex items-center gap-2">
                            <ShoppingCart /> Add to Cart
                        </button>
                        <button className="btn btn-outline border-[#029fae] text-[#029fae] hover:bg-[#029fae] hover:text-white">
                            <Heart />
                        </button>
                    </div>

                    {/* Additional Info */}
                    <div className="border-t pt-6">
                        <h3 className="text-xl font-semibold mb-4">Product Details</h3>
                        <div className="space-y-2">
                            <p><span className="font-medium">Category:</span> {product.short_description}</p>
                            <p><span className="font-medium">Availability:</span> {product.stock}</p>
                            <p><span className="font-medium">SKU:</span> {product.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail; 