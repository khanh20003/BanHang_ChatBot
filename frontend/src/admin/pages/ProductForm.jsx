import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiImage, FiTag, FiDollarSign, FiCheckSquare } from 'react-icons/fi';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    price: '',
    currentPrice: '',
    status: 'active',
    product_type: '',
    tag: '',
    short_description: '',
    stock: '',
    category_id: ''
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://127.0.0.1:8000/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://127.0.0.1:8000/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      const data = await response.json();
      setFormData({
        title: data.title || '',
        image: data.image || '',
        price: data.price || '',
        currentPrice: data.currentPrice || '',
        status: data.status || 'active',
        product_type: data.product_type || '',
        tag: data.tag || '',
        short_description: data.short_description || '',
        stock: data.stock || '',
        category_id: data.category_id || ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({
        ...formData,
        image: files && files[0] ? files[0] : formData.image,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData();
    form.append('title', formData.title);
    form.append('price', Number(formData.price));
    form.append('currentPrice', formData.currentPrice ? Number(formData.currentPrice) : '');
    form.append('status', formData.status);
    form.append('product_type', formData.product_type || '');
    form.append('tag', formData.tag || '');
    form.append('short_description', formData.short_description || '');
    form.append('stock', Number(formData.stock));
    form.append('category_id', Number(formData.category_id));
    if (formData.image instanceof File) {
      form.append('image', formData.image);
    }

    try {
      let url = 'http://127.0.0.1:8000/products/';
      let method = 'POST';
      if (id) {
        url = `http://127.0.0.1:8000/products/${id}`;
        method = 'PUT';
      }
      const res = await fetch(url, {
        method,
        body: form,
      });
      if (!res.ok) {
        const errorData = await res.json();
        setError(JSON.stringify(errorData.detail));
        return;
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)' }}>
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors duration-300 transform hover:-translate-x-1"
          >
            <FiArrowLeft className="mr-2 animate-pulse" />
            Back to Products
          </button>
          <h1 className="text-4xl font-extrabold mt-4 text-gray-800 bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg animate-fadeIn">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiTag className="mr-2 text-indigo-500 animate-bounce" /> Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiImage className="mr-2 text-indigo-500 animate-spin-slow" /> Product Image
          </label>
          {typeof formData.image === "string" && formData.image && (
            <img
              src={
                formData.image.startsWith('http')
                  ? formData.image
                  : `http://127.0.0.1:8000/${formData.image.replace(/^\/+/, '')}`
              }
              alt="Current Product Image"
              className="mb-2 h-24 w-24 object-contain border-2 border-gray-200 rounded-xl transform hover:scale-110 transition-all duration-300"
            />
          )}
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          />
          <small className="text-gray-500 block mt-1">Leave empty to keep current image.</small>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiDollarSign className="mr-2 text-indigo-500 animate-pulse" /> Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiDollarSign className="mr-2 text-indigo-500 animate-pulse" /> Current Price
          </label>
          <input
            type="number"
            name="currentPrice"
            value={formData.currentPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiCheckSquare className="mr-2 text-indigo-500 animate-bounce" /> Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiTag className="mr-2 text-indigo-500 animate-bounce" /> Type
          </label>
          <select
            name="product_type"
            value={formData.product_type}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          >
            <option value="">Select Type</option>
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="best_seller">Best Seller</option>
          </select>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiTag className="mr-2 text-indigo-500 animate-bounce" /> Tag
          </label>
          <select
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          >
            <option value="">No Tag</option>
            <option value="new">New</option>
            <option value="sale">Sale</option>
          </select>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiTag className="mr-2 text-indigo-500 animate-pulse" /> Stock
          </label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
          <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <FiTag className="mr-2 text-indigo-500 animate-bounce" /> Category
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <FiTag className="mr-2 text-indigo-500 animate-pulse" /> Short Description
        </label>
        <textarea
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
          rows="4"
          className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
          placeholder="Enter a brief description of the product..."
        />
      </div>

      <div className="mt-8">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-xl shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70"
          onClick={handleSubmit}
        >
          {loading ? 'Saving...' : (id ? 'Update Product' : 'Create Product')}
        </button>
      </div>
    </div>
  );
};

export default ProductForm;