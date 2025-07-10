import React, { useEffect, useState, useCallback } from 'react';
import { FiRefreshCw, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import debounce from 'lodash.debounce';

const ORDER_STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        skip: (currentPage - 1) * ordersPerPage,
        limit: ordersPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await fetch(`http://localhost:8000/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch orders');
      }
      const data = await response.json();
      console.log('Orders data:', data);
      setOrders(data.orders);
      setTotalOrders(data.total_orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, ordersPerPage]);

  const debouncedFetchOrders = useCallback(debounce(fetchOrders, 500), [fetchOrders]);

  useEffect(() => {
    debouncedFetchOrders();
    return () => debouncedFetchOrders.cancel();
  }, [currentPage, statusFilter, searchTerm, debouncedFetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:8000/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update order status');
      }
      setOrders(orders.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } catch (err) {
      alert(err.message);
    }
  };

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const handleViewDetails = (order) => {
    console.log('Selected order:', order);
    console.log('Order items:', order.items);
    order.items.forEach(item => console.log('Item image:', item.product?.image));
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedOrder(null);
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-md">Orders</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all"
          disabled={loading}
        >
          <FiRefreshCw className={`mr-2 w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-center py-6 text-gray-600">Loading...</div>
      ) : error ? (
        <div className="text-red-600 p-6">{error}</div>
      ) : (
        <>
          <div className="flexsin flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by ID or Customer..."
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
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all"
                disabled={loading}
              >
                {ORDER_STATUSES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-50 to-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{order.shipping_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{order.shipping_phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-600 truncate max-w-xs">{order.shipping_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-900">{order.total_amount?.toLocaleString('vi-VN')}đ</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className="border rounded-lg px-3 py-2 text-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all"
                          disabled={loading}
                        >
                          {ORDER_STATUSES.slice(1).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-md text-gray-600">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-md font-medium">
                        <span
                          className="text-indigo-600 hover:text-indigo-900 transition-colors cursor-pointer"
                          onClick={() => handleViewDetails(order)}
                        >
                          View Details
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-6 text-center text-md text-gray-500">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {showDetail && selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-2xl max-w-2xl w-full p-8 relative transform animate-scaleUp">
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl transition-colors duration-200"
                  onClick={handleCloseDetail}
                  title="Close"
                >
                  <FiX />
                </button>
                <h2 className="text-3xl font-bold mb-6 text-indigo-800 drop-shadow-md">Order #{selectedOrder.id} Details</h2>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <p className="text-lg text-gray-900"><b>Customer:</b> {selectedOrder.shipping_name}</p>
                    <p className="text-lg text-gray-900"><b>Phone:</b> {selectedOrder.shipping_phone}</p>
                    <p className="text-lg text-gray-900"><b>Address:</b> {selectedOrder.shipping_address}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-lg text-gray-900"><b>Total:</b> {selectedOrder.total_amount?.toLocaleString('vi-VN')}đ</p>
                    <p className="text-lg text-gray-900"><b>Status:</b> <span className={`px-2 py-1 rounded-full text-white ${
                      selectedOrder.status === 'completed' ? 'bg-green-500' :
                      selectedOrder.status === 'pending' ? 'bg-yellow-500' :
                      selectedOrder.status === 'processing' ? 'bg-blue-500' :
                      'bg-red-500'
                    }`}>{selectedOrder.status}</span></p>
                    <p className="text-lg text-gray-900"><b>Created At:</b> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-indigo-700 border-b border-indigo-200 pb-2">Products</h3>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                          <img
                            src={
                              item.image ||
                              item.image_url ||
                              (item.product && item.product.image) ||
                              'https://placeholder.co/50'
                            }
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg border border-indigo-100"
                            onError={(e) => console.log('Image load error for item:', {
                              id: item.id,
                              title: item.title,
                              image: item.image,
                              image_url: item.image_url,
                              product_image: item.product ? item.product.image : null
                            })}
                          />
                          <div className="flex-1">
                            <div className="text-md font-medium text-gray-900">{item.product.title || 'Unknown Product'}</div>
                            <div className="text-md text-gray-600">
                              {item.quantity} x {item.price?.toLocaleString('vi-VN')}đ = {(item.quantity * item.price)?.toLocaleString('vi-VN')}đ
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-center py-4 bg-white rounded-lg">No products found in this order.</div>
                  )}
                </div>
              </div>
            </div>
          )}
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
                Showing <span className="font-semibold">{(currentPage - 1) * ordersPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * ordersPerPage, totalOrders)}</span> of <span className="font-semibold">{totalOrders}</span> orders
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
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="px-3 py-2 rounded-r-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;