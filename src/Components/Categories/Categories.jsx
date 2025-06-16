import { useEffect, useState } from "react";
import axios from "axios";

const Category = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/categories")
            .then(res => setCategories(res.data))
            .catch(err => console.error("Lỗi khi fetch category:", err));
    }, []);

    return (
        <div className="py-10 lg:container">
            <h2 className="text-2xl font-bold mb-6">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {categories.map(category => (
                    <div key={category.id} className="flex flex-col items-center bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition">
                        <img src={category.image} alt={category.name} className="h-16 w-16 object-contain mb-2" />
                        <span className="text-sm font-medium">{category.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Category;
