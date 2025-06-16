import { useEffect, useState } from "react";
import axios from "axios";

const Delivery = () => {
    const [deliveries, setDeliveries] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/deliveries")
            .then(res => setDeliveries(res.data))
            .catch(err => console.error("Lỗi khi lấy dữ liệu deliveries:", err));
    }, []);

    return (
        <div className="lg:container py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
                {deliveries.map(delivery => (
                    <div key={delivery.id} className="p-4 shadow rounded-lg border">
                        <img src={delivery.icon} alt={delivery.title} className="w-12 h-12 mx-auto mb-2" />
                        <h3 className="font-bold text-lg">{delivery.title}</h3>
                        <p className="text-sm text-gray-600">{delivery.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Delivery;
