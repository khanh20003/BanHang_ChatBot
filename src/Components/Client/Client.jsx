import { useEffect, useState } from "react";
import axios from "axios";

const Client = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/clients")
            .then(res => setClients(res.data))
            .catch(err => console.error("Lỗi khi lấy dữ liệu clients:", err));
    }, []);

    return (
        <div className="py-10 lg:container">
            <h2 className="text-2xl font-bold text-center mb-6">Our Clients</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-center">
                {clients.map(client => (
                    <div key={client.id} className="flex flex-col items-center">
                        <img src={client.logo} alt={client.name} className="h-16 object-contain mb-2" />
                        {client.review && <p className="text-xs text-center">{client.review}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Client;
