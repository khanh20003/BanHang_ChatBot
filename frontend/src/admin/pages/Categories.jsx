import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";

const getFullImageUrl = (image) => {
  if (!image) return "https://placeholder.co/60";
  if (image.startsWith("http")) return image;
  return `http://127.0.0.1:8000${image}`;
};

const CategoryCard = ({ category, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center space-x-4">
      <img
        src={getFullImageUrl(category.image)}
        alt={category.name}
        className="h-15 w-15 rounded-lg object-cover border-2 border-indigo-200 hover:border-indigo-400 transition-all"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-black">{category.name}</h3>
        <p className="text-md text-gray-600">Products: {category.products || 0}</p>
      </div>
    </div>
    <div className="mt-4 flex justify-end space-x-3">
      <button
        onClick={() => onEdit(category)}
        className="text-indigo-600 hover:text-indigo-900 transition-colors"
      >
        <FiEdit2 className="w-6 h-6" />
      </button>
      <button
        onClick={() => onDelete(category.id)}
        className="text-red-600 hover:text-red-900 transition-colors"
      >
        <FiTrash2 className="w-6 h-6" />
      </button>
    </div>
  </div>
);

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        navigate("/admin/login");
        return;
      }
      const response = await fetch("http://127.0.0.1:8000/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }
        throw new Error(errorData?.detail || "Failed to fetch categories");
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`http://127.0.0.1:8000/categories/${categoryId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || "Failed to delete category");
        }
        setCategories(categories.filter((category) => category.id !== categoryId));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredCategories = categories.filter((category) =>
    category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false
  );

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-50">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Categories</h1>
        <button
          onClick={() => navigate("/admin/categories/new")}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all"
        >
          <FiPlus className="mr-2 w-5 h-5" /> Add Category
        </button>
      </div>
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={(category) => navigate(`/admin/categories/edit/${category.id}`)}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-md text-gray-500 p-6">No categories found</div>
        )}
      </div>
    </div>
  );
};

export default Categories;