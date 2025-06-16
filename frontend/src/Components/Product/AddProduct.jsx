import { useState } from "react";
import axios from "axios";

const AddProduct = () => {
    const [product, setProduct] = useState({
        title: "",
        image: "",
        price: "",
        currentPrice: "",
        status: "",
        product: ""  // category
    });

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/products", product);
            alert("Thêm sản phẩm thành công!");
            setProduct({ title: "", image: "", price: "", currentPrice: "", status: "", product: "" });
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Đã xảy ra lỗi.");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <h2 className="text-xl font-bold mb-4">Thêm sản phẩm</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="title" value={product.title} onChange={handleChange} placeholder="Tên sản phẩm" className="w-full p-2 border rounded" required />
                <input type="text" name="image" value={product.image} onChange={handleChange} placeholder="Link hình ảnh" className="w-full p-2 border rounded" required />
                <input type="number" name="price" value={product.price} onChange={handleChange} placeholder="Giá" className="w-full p-2 border rounded" required />
                <input type="number" name="currentPrice" value={product.currentPrice} onChange={handleChange} placeholder="Giá gốc (nếu có)" className="w-full p-2 border rounded" />
                <input type="text" name="status" value={product.status} onChange={handleChange} placeholder="Trạng thái (mới, bán chạy...)" className="w-full p-2 border rounded" />
                <select name="product_type" value={product.product_type} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">Chọn danh mục</option>
                    <option value="newest">Newest</option>
                    <option value="trending">Trending</option>
                    <option value="best_seller">Best Seller</option>
                </select>
                <button type="submit" className="bg-[#007580] text-white px-4 py-2 rounded">Thêm sản phẩm</button>
            </form>
        </div>
    );
};

export default AddProduct;
