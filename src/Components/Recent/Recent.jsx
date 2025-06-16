import React, { useEffect, useState } from "react";
import axios from "axios";

const Banner = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Gọi API backend lấy danh sách products
    axios.get("http://localhost:8000/products")
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error("Lỗi khi lấy products:", error);
      });
  }, []);

  return (
    <div>
      {products.length === 0 && <p>Loading products...</p>}
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.status}</p>
          <p>{product.price}</p>
          <img src={product.image} alt={product.title} />
        </div>
      ))}
    </div>
  );
};

export default Banner;
