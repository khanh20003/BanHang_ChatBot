import { useEffect, useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { MoveRight } from "lucide-react";
import axios from "axios";

const Banner = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8000/banners")
            .then(response => {
                setBanners(response.data);
            })
            .catch(error => {
                console.error("Lỗi khi lấy dữ liệu banner:", error);
            });
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <div className="lg:container">
            <div className="slider-container slider_container w-full h-full">
                <Slider {...settings}>
                    {
                        banners?.map((banner) => (
                            <div key={banner?.id} className="banner_slide_item">

                                {/* banner text  */}
                                <div className="banner_text">
                                    <p className="text-sm font-inter text-[#272343] uppercase font-normal">{banner?.subTitle}</p>
                                    <h3 className="text-6xl text-[#272343] font-inter capitalize leading-16 max-w-[631px] w-full font-bold mb-5">{banner?.title}</h3>
                                    <button className="max-w-[171px] w-full flex items-center justify-center gap-2 h-[52px] bg-[#029fae] rounded-lg capitalize text-white cursor-pointer">shop now <MoveRight /></button>
                                </div>

                                {/* banner image  */}
                                <div className="banner_image w-full h-full flex items-center justify-end">
                                    <img src={banner?.image} alt={banner?.title} />
                                </div>

                            </div>
                        ))
                    }
                </Slider>
            </div>
        </div>
    );
};

export default Banner;
