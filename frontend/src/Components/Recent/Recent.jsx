import { useEffect, useState } from "react";
import axios from "axios";
import SectionTitle from "../SectionTitle/SectionTitle";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { ShoppingCart } from "lucide-react";

const Recent = () => {
    const [recents, setRecents] = useState([]);
    const fallbackImg = '/fallback-product.png';

    useEffect(() => {
        fetchRecents();
    }, []);

    const fetchRecents = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/recents");
            setRecents(response.data);
        } catch (error) {
            console.error("Failed to fetch recent products", error);
        }
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3 } },
            { breakpoint: 900, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
        ],
        appendDots: dots => (
            <div className="flex justify-center mt-6">{dots}</div>
        ),
        customPaging: i => (
            <div className="w-3 h-3 mx-1 rounded-full bg-[#ff2c1d] opacity-60 slick-dot" />
        ),
    };

    return (
        <div className="w-full bg-[#f5f7fa] py-12">
            <div className="max-w-7xl mx-auto px-4">
                <SectionTitle title="Sản phẩm mới" mb="mb-10" />
                <Slider {...settings}>
                    {recents?.map((product, index) => (
                        <div key={index} className="px-3">
                            <div className="group relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.03] border border-[#f1f1f1]">
                                <div className="relative h-[220px] flex items-center justify-center bg-[#f8f8fa]">
                                    <img
                                        className="w-auto h-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
                                        src={product.image_url || fallbackImg}
                                        alt={product.title}
                                        onError={e => {
                                            if (e.target.src !== fallbackImg) e.target.src = fallbackImg;
                                        }}
                                    />
                                    {product.status && (
                                        <div className="absolute top-3 left-3 bg-[#ff2c1d] text-white px-3 py-1 rounded-full text-xs font-bold shadow">{product.status}</div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between p-5">
                                    <h4 className="text-lg font-bold text-[#22223b] mb-2 line-clamp-2 min-h-[48px]">{product.title}</h4>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl font-extrabold text-[#ff2c1d]">${product.price}</span>
                                        {product.current_price && (
                                            <span className="text-base text-[#9a9caa] line-through">${product.current_price}</span>
                                        )}
                                    </div>
                                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#ff2c1d] text-white font-bold shadow hover:bg-[#ff5e3a] transition-all text-base mt-2">
                                        <ShoppingCart size='1.2rem' /> Mua ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Recent;
