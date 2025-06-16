import { useEffect, useState } from "react";
import axios from "axios";

const Features = () => {
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/features")
            .then(res => setFeatures(res.data))
            .catch(err => console.error("Lỗi khi lấy dữ liệu features:", err));
    }, []);

    return (
        <div className="lg:container py-10">
            <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(feature => (
                    <div key={feature.id} className="p-6 border rounded-lg shadow text-center">
                        <img src={feature.icon} alt={feature.title} className="w-14 h-14 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;
