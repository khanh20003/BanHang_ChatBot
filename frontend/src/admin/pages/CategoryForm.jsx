import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiImage, FiTag } from 'react-icons/fi';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '', // giữ để preview
    products: 0
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://127.0.0.1:8000/categories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }

      const data = await response.json();
      setFormData({
        name: data.name || '',
        image: data.image || '',
        products: data.products || 0
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: URL.createObjectURL(file) // preview
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const url = id 
        ? `http://127.0.0.1:8000/categories/${id}`
        : 'http://127.0.0.1:8000/categories';

      const form = new FormData();
      form.append('name', formData.name);
      form.append('products', formData.products);
      if (imageFile) {
        form.append('image', imageFile);
      }

      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, để browser tự set multipart/form-data
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(id ? 'Failed to update category' : 'Failed to create category');
      }

      navigate('/admin/categories');
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
            onClick={() => navigate('/admin/categories')}
            className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors duration-300 transform hover:-translate-x-1"
          >
            <FiArrowLeft className="mr-2 animate-pulse" />
            Back to Categories
          </button>
          <h1 className="text-4xl font-extrabold mt-4 text-gray-800 bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            {id ? 'Edit Category' : 'Add New Category'}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg animate-fadeIn">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
            <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FiTag className="mr-2 text-indigo-500" /> Title
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
            />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
            <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <FiImage className="mr-2 text-indigo-500" /> Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
            />
            {formData.image && (
              <img
                src={
                  formData.image.startsWith('/')
                    ? `http://127.0.0.1:8000${formData.image}`
                    : formData.image
                }
                alt="Preview"
                className="mt-4 h-24 w-24 object-cover rounded-lg border"
              />
            )}
          </div>

          {id && (
            <div className="bg-white rounded-xl p-6 shadow-xl transform hover:scale-105 transition-all duration-500">
              <label className="block text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <FiTag className="mr-2 text-indigo-500" /> Products Count
              </label>
              <input
                type="number"
                name="products"
                value={formData.products}
                onChange={handleChange}
                min="0"
                className="w-full px-5 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
              />
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4 rounded-xl shadow-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70"
          >
            {loading ? 'Saving...' : (id ? 'Update Category' : 'Create Category')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;