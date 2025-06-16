import { useEffect, useState } from "react";
import axios from "axios";
import SectionTitle from "../SectionTitle/SectionTitle";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const fallbackImg = '/fallback-product.png'; // Đường dẫn ảnh dự phòng, đảm bảo file này tồn tại trong public/assets

const Features = () => {
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/features");
                setFeatures(response.data);
            } catch (error) {
                console.error("Failed to fetch features", error);
            }
        };
        fetchFeatures();
    }, []);

    // Hàm chuẩn hóa đường dẫn ảnh feature
    const getImageUrl = (img) => {
        if (!img) return fallbackImg;
        if (img.startsWith('http')) return img;
        if (img.startsWith('images/')) return `http://127.0.0.1:8000/static/${img}`;
        return `http://127.0.0.1:8000/static/images/features/${img}`;
    };

    return (
        <div className="w-full bg-[#f5f7fa] py-10">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-[#22223b] mb-8 text-center tracking-wide uppercase">
                    Sản phẩm nổi bật
                </h2>
                <div className="w-full overflow-x-auto">
                  <div className="flex gap-8 min-w-full pb-2">
                    {features.length > 0 ? (
                      features.map((feature) => (
                        <div
                          key={feature.id}
                          className="relative flex-shrink-0 w-[340px] h-[180px] rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 bg-black"
                        >
                          <img
                            src={getImageUrl(feature.image_url)}
                            alt={feature.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = fallbackImg;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10"></div>
                          <div className="relative z-20 flex flex-col justify-center h-full pl-8">
                            <div className="text-2xl font-bold text-white mb-2 drop-shadow-lg truncate">{feature.title}</div>
                            <div className="text-base text-white/80 mb-2 truncate">{feature.description}</div>
                            <div className="text-[#ff2c1d] font-bold text-xl">${feature.price}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 w-full py-8">
                        Không có sản phẩm nổi bật nào để hiển thị.
                      </div>
                    )}
                  </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
