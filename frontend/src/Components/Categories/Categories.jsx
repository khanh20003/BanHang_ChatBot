import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SectionTitle from './../SectionTitle/SectionTitle';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Categories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/categories")
            .then(res => setCategories(res.data))
            .catch(err => console.error("Lỗi lấy categories:", err));
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 4,
        slidesToScroll: 1,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
        responsive: [
            { breakpoint: 1280, settings: { slidesToShow: 3 } },
            { breakpoint: 900, settings: { slidesToShow: 2 } },
            { breakpoint: 600, settings: { slidesToShow: 1 } },
        ]
    };

    const getImageUrl = (imagePath) =>
        imagePath?.startsWith('http') ? imagePath : `http://localhost:8000${imagePath}`;
        
    const fallbackImg = '/fallback-product.png';

    function CustomNextArrow(props) {
        const { onClick } = props;
        return (
            <div
                className="absolute right-[-32px] top-1/2 transform -translate-y-1/2 cursor-pointer z-10 bg-white rounded-full p-2 shadow-lg hover:bg-[#ff2c1d]/20"
                onClick={onClick}
            >
                <ChevronRight size={28} color="#ff2c1d" />
            </div>
        );
    }

    function CustomPrevArrow(props) {
        const { onClick } = props;
        return (
            <div
                className="absolute left-[-32px] top-1/2 transform -translate-y-1/2 cursor-pointer z-10 bg-white rounded-full p-2 shadow-lg hover:bg-[#ff2c1d]/20"
                onClick={onClick}
            >
                <ChevronLeft size={28} color="#ff2c1d" />
            </div>
        );
    }

    return (
        <div className="w-full bg-[#f5f7fa] py-12">
            <div className="max-w-7xl mx-auto px-4 relative">
                <SectionTitle title="Danh mục nổi bật" mb="mb-10" />
                <Slider {...settings}>
                    {categories.map((category, index) => (
                        <div key={index} className="px-3">
                            <Link to={`/category/${category.id}`} className="block">
                                <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105 bg-white border border-[#f1f1f1]">
                                    <img
                                        className="w-full h-full object-cover"
                                        src={getImageUrl(category.image) || fallbackImg}
                                        alt={category.title || 'Category'}
                                        onError={e => {
                                            if (e.target.src !== fallbackImg) e.target.src = fallbackImg;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col gap-1 z-10">
                                        <h4 className="text-2xl font-bold capitalize drop-shadow-lg">{category.title}</h4>
                                        <p className="text-base font-medium">
                                            {category.products ? `${category.products} Sản Phẩm` : 'Chưa Có Sản Phẩm'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default Categories;
