import React from 'react';

const ProductListMessage = ({ products }) => {
    return (
        <div className="product-list-bubble bot-message">
            <div>Sản phẩm liên quan:</div>
            <ul>
                {products.map(p => (
                    <li key={p.id}> {/* Sử dụng ID sản phẩm làm key */}
                        <a href={`http://localhost:3000/product/${p.id}`} target="_blank" rel="noopener noreferrer">
                            {p.name} - {p.price} đ
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductListMessage; 