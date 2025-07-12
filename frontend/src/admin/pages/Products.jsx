import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiRefreshCw, FiFilter } from 'react-icons/fi';
import debounce from 'lodash.debounce';

const ProductTable = ({ products, onEdit, onDelete, loading }) => {
  return (
    <div className="mt-6 overflow-x-auto bg-white rounded-xl shadow-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products && products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-md text-black">{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-12 w-12 flex-shrink-0">
                    <img
                      className="h-12 w-12 rounded-full object-cover border-2 border-indigo-200 hover:border-indigo-400 transition-all"
                      src={
                        product.image
                          ? product.image.startsWith('http')
                            ? product.image
                            : `http://127.0.0.1:8000/${product.image.replace(/^\/+/, '')}`
                          : 'https://placeholder.co/40'
                      }
                      alt={product.title}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-black">{product.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-black">{product.price}đ</td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-black">{product.currentPrice || '-'}đ</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{product.product_type || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${product.tag === 'new' ? 'bg-blue-100 text-blue-800' : product.tag === 'sale' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.tag ? product.tag.charAt(0).toUpperCase() + product.tag.slice(1) : 'No Tag'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{product.category_id || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-md font-medium">
                  <button onClick={() => onEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors" disabled={loading}>
                    <FiEdit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900 transition-colors" disabled={loading}>
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="px-6 py-6 text-center text-md text-gray-500">No products found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      const params = new URLSearchParams({
        skip: (currentPage - 1) * productsPerPage,
        limit: productsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { product_type: typeFilter }),
        ...(tagFilter !== 'all' && { tag: tagFilter }),
      });
      const response = await fetch(`http://127.0.0.1:8000/admin/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products);
      setTotalProducts(data.total_products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, productsPerPage, statusFilter, typeFilter, tagFilter, navigate]);

  const debouncedFetchProducts = useCallback(debounce(fetchProducts, 500), [fetchProducts]);

  useEffect(() => {
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [currentPage, searchTerm, statusFilter, typeFilter, tagFilter, debouncedFetchProducts]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`http://127.0.0.1:8000/products/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to delete product');
        }
        setProducts(products.filter(product => product.id !== productId));
        setTotalProducts(prev => prev - 1);
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Products</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchProducts}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all"
            disabled={loading}
          >
            <FiPlus className="mr-2 w-5 h-5" /> Add Product
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all"
            disabled={loading}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {/* Bộ lọc */}
        <div className="flex gap-2 items-center">
          <FiFilter className="text-indigo-500" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="all">All Types</option>
            <option value="newest">Newest</option>
            <option value="trending">Trending</option>
            <option value="best_seller">Best Seller</option>
          </select>
          <select
            value={tagFilter}
            onChange={e => { setTagFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          >
            <option value="all">All Tags</option>
            <option value="new">New</option>
            <option value="sale">Sale</option>
          </select>
        </div>
      </div>
      <ProductTable
        products={products}
        onEdit={(product) => navigate(`/admin/products/edit/${product.id}`)}
        onDelete={handleDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-b-xl shadow-inner">
        <div className="flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="ml-3 px-4 py-2 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <p className="text-md text-gray-700">
            Showing <span className="font-semibold">{(currentPage - 1) * productsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * productsPerPage, totalProducts)}</span> of <span className="font-semibold">{totalProducts}</span> products
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 rounded-l-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-md text-gray-700">Page {currentPage} of {totalPages}</span>
            {/* Input chuyển trang thực sự */}
            <form
              onSubmit={e => {
                e.preventDefault();
                const page = parseInt(e.target.elements.pageInput.value, 10);
                if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
                  setCurrentPage(page);
                }
              }}
              className="flex items-center"
            >
              <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-2 rounded-r-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
              <input
                name="pageInput"
                type="number"
                min={1}
                max={totalPages}
                defaultValue={currentPage}
                className="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center mx-1"
                disabled={loading || totalPages === 0}
                style={{ minWidth: 0 }}
              />
              <button
                type="submit"
                className="px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 ml-1 disabled:opacity-50"
                disabled={loading || totalPages === 0}
                title="Go to page"
              >
                Go
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;