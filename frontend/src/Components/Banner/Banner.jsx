import { useEffect, useState } from "react";
import Slider from "react-slick";
import axios from "axios";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Banner() {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/banners")
      .then((res) => setBanners(res.data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
  };

  return (
    <div className="w-full overflow-hidden relative">
      <Slider {...settings}>
        {banners.map((banner) => (
          <div key={banner.id}>
            <div className="flex flex-col md:flex-row items-center justify-between w-full bg-white px-4 md:px-24 py-10 md:py-16 min-h-[400px] md:min-h-[550px]">
              {/* Image */}
              <div className="w-full md:w-1/2 flex justify-center">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full max-h-[500px] object-contain"
                  onError={(e) => (e.target.src = "/fallback-product.png")}
                />
              </div>

              {/* Text */}
              <div className="w-full md:w-1/2 text-center md:text-left mt-6 md:mt-0 space-y-4">
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                  {banner.sub_title}
                </p>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {banner.title}
                </h2>
                <p className="text-base md:text-lg text-gray-600">
                  {banner.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Custom CSS */}
      <style jsx global>{`
        .slick-prev,
        .slick-next {
          z-index: 30;
          width: 60px;
          height: 60px;
          background-color: rgba(0, 0, 0, 0.4);
          border-radius: 9999px;
          top: 50%;
          transform: translateY(-50%);
          display: flex !important;
          justify-content: center;
          align-items: center;
        }

        .slick-prev:before,
        .slick-next:before {
          font-size: 30px;
          color: #fff;
          opacity: 1;
        }

        .slick-prev {
          left: 20px;
        }

        .slick-next {
          right: 20px;
        }

        .slick-dots li button:before {
          font-size: 12px;
          color: #bbb;
        }

        .slick-dots li.slick-active button:before {
          color: #000;
        }
      `}</style>
    </div>
  );
}
