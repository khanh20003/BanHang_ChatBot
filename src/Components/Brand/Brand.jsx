import { useEffect, useState } from "react";
import axios from "axios";

const Brand = () => {
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/brands")
            .then(res => setBrands(res.data))
            .catch(err => console.error("Lỗi khi fetch brand:", err));
    }, []);

    return (
        <div className="py-10 lg:container">
            <h2 className="text-2xl font-bold mb-6">Our Brands</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {brands.map(brand => (
                    <div key={brand.id} className="flex items-center justify-center bg-white shadow-md rounded-lg p-4">
                        <img src={brand.logo} alt={brand.name} className="max-h-12 object-contain" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Brand;
