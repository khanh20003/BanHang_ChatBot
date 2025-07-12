import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  ShoppingBag, 
  MessageSquare, 
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <ShoppingBag size={20} />, label: 'Products', path: '/admin/products' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <MessageSquare size={20} />, label: 'Chat History', path: '/admin/chat' },
    { icon: <Users size={20} />, label: 'Categories', path: '/admin/categories' },
    { icon: <ShoppingBag size={20} />, label: 'Orders', path: '/admin/orders' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 w-64`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold text-black">Admin Panel</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-md lg:hidden hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-2 text-black rounded-md hover:bg-gray-100"
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className="relative ml-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">Admin User</span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 