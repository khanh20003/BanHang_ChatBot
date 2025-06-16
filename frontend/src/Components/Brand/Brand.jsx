import { useEffect, useState } from "react";
import axios from "axios";

const Brand = () => {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/brands")
      .then((res) => setBrands(res.data))
      .catch((err) => console.error("Failed to fetch brands", err));
  }, []);

  // Hàm chuẩn hóa đường dẫn logo
  const getLogoUrl = (logo) => {
    if (!logo) return "/no-logo.png";
    if (logo.startsWith("http")) return logo;
    if (logo.startsWith("images/")) return `http://127.0.0.1:8000/static/${logo}`;
    return `http://127.0.0.1:8000/static/images/brands/${logo}`;
  };

  return (
    <div className="w-full bg-[#f5f7fa] py-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-[#22223b] mb-8 text-center tracking-wide uppercase">
          Thương hiệu nổi bật
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
          {brands.length > 0 ? (
            brands.map((brand) => (
              <div
                key={brand.id}
                className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-[#f1f1f1] hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-24 h-24 bg-gray-50 rounded-full mb-3 border border-gray-100 group-hover:shadow-md transition-all">
                  <img
                    src={getLogoUrl(brand.logo)}
                    alt={brand.name}
                    className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/no-logo.png";
                    }}
                  />
                </div>
                <div className="text-base font-semibold text-[#22223b] text-center group-hover:text-[#ff2c1d] transition-colors truncate w-24">
                  {brand.name}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">
              Không có thương hiệu nào để hiển thị.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Brand;
