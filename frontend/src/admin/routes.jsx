import React from "react";
import { Routes, Route, Navigate, createBrowserRouter } from "react-router-dom";
import AdminLayout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductForm from "./pages/ProductForm";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import AdminProducts from './pages/Products';
import CategoryForm from './pages/CategoryForm';
import Users from './pages/Users';
import ChatHistory from './pages/ChatHistory';

import Home from '../Pages/Home';
import ClientProducts from '../Pages/Products';
import ProductDetail from '../Pages/ProductDetail';
import Cart from '../Pages/Cart/Cart';
import Checkout from '../Pages/Checkout';
import ClientLogin from '../Pages/Login';
import Register from '../Pages/Register';
import Profile from '../Pages/Profile';
import Order from '../Pages/Order';
import OrderDetail from '../Pages/OrderDetail';
import OrderSuccess from '../Pages/OrderSuccess';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import About from '../Pages/About';
import Contact from '../Pages/Contact';


// Error boundary component
const ErrorBoundary = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600">Please try refreshing the page</p>
      </div>
    </div>
  );
};

// TODO: Implement authentication check
const isAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  return !!token;
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <ErrorBoundary>{children}</ErrorBoundary>;
};

// Client layout wrapper
const ClientLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <Navbar />
      {children}
      <Footer />
    </ErrorBoundary>
  );
};

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin/login" />;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        
        <Route path="categories" element={<Categories />} />
        <Route path="categories/new" element={<CategoryForm />} />
        <Route path="categories/edit/:id" element={<CategoryForm />} />
        
        <Route path="users" element={<Users />} />
        <Route path="chat" element={<ChatHistory />} />
        <Route path="orders" element={<Orders />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ClientLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'products',
        element: <ClientProducts />
      },
      {
        path: 'categories',
        element: <Categories />
      },
      {
        path: 'products/:id',
        element: <ProductDetail />
      },
      {
        path: 'cart',
        element: <Cart />
      },
      {
        path: 'checkout',
        element: <Checkout />
      },
      {
        path: 'order-success',
        element: <OrderSuccess />
      },
      {
        path: 'login',
        element: <ClientLogin />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'orders',
        element: <Orders />
      },
      {
        path: 'orders/:id',
        element: <OrderDetail />
      },
      {
        path: 'about',
        element: <About />
      }
    ]
  }
]); 