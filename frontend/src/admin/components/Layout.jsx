import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { FiHome, FiShoppingBag, FiList, FiTag, FiLogOut } from "react-icons/fi";

const AdminLayout = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-indigo-600">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <Link
            to="/admin"
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 ${
              isActive("/admin") && !isActive("/admin/products") && !isActive("/admin/categories") && !isActive("/admin/orders") ? "bg-indigo-50 text-indigo-600" : ""
            }`}
          >
            <FiHome className="mr-3" />
            Dashboard
          </Link>
          <Link
            to="/admin/products"
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 ${
              isActive("/admin/products") ? "bg-indigo-50 text-indigo-600" : ""
            }`}
          >
            <FiShoppingBag className="mr-3" />
            Products
          </Link>
          <Link
            to="/admin/categories"
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 ${
              isActive("/admin/categories") ? "bg-indigo-50 text-indigo-600" : ""
            }`}
          >
            <FiTag className="mr-3" />
            Categories
          </Link>
          <Link
            to="/admin/orders"
            className={`flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 ${
              isActive("/admin/orders") ? "bg-indigo-50 text-indigo-600" : ""
            }`}
          >
            <FiList className="mr-3" />
            Orders
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 w-full text-left"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 