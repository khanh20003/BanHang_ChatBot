import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Wishlist</h1>
      {wishlist.length === 0 ? (
        <p>Your favorite products will appear here. Start adding items to your wishlist!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow p-4 flex flex-col">
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image?.startsWith("http") ? product.image : `http://127.0.0.1:8000/static/${product.image}`}
                  alt={product.title}
                  className="h-auto w-full object-cover rounded mb-4"
                />
                <h2 className="text-lg font-semibold">{product.title}</h2>
              </Link>
              <span className="text-indigo-600 font-bold mt-2">
                {(product.currentPrice || product.price)?.toLocaleString('vi-VN')}₫
              </span>
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;