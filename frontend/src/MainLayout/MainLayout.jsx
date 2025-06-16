import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from './../Components/Navbar/Navbar';
import Home from "../Pages/Home/Home";
import Auth from "../Pages/Auth/Auth";
import Login from "../Pages/Auth/Login/Login";
import Register from "../Pages/Auth/Register/Register";
import Error from "../Pages/Error/Error";
import AuthCheck from "../AuthCheck/AuthCheck";
import Footer from "../Components/Footer/Footer";

import ProductDetail from "../Pages/ProductDetail/ProductDetail";
import Cart from "../Pages/Cart/Cart";
import Products from "../Pages/Products/Products";
import ProductForm from "../admin/pages/ProductForm";   
import CategoryProducts from "../Pages/CategoryProducts/CategoryProducts";
import Checkout from "../Pages/Checkout/Checkout";
import OrderSuccess from "../Pages/OrderSuccess";

import { CartProvider } from "../context/CartContext";
import { Toaster } from "react-hot-toast";
import { UserProvider, useUser } from "../context/UserContext";

import Categories from "../admin/pages/Categories";
import CategoryForm from '../admin/pages/CategoryForm';
// Admin imports
import AdminLayout from "../admin/layouts/AdminLayout";
import AdminLogin from "../admin/pages/Login";

import AdminDashboard from "../admin/pages/Dashboard";
import AdminProducts from "../admin/pages/Products";

import AdminUsers from "../admin/pages/Users";

import AdminChatHistory from "../admin/pages/ChatHistory";
import ProtectedRoute from "../admin/components/ProtectedRoute";

import Chatbot from '../Components/Chatbot';
import Orders from "../admin/pages/Orders";


const MainLayout = () => {
    return (
        <UserProvider>
            <MainLayoutContent />
        </UserProvider>
    );
};

const MainLayoutContent = () => {
    const { customerId } = useUser();
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin" element={
                        <ProtectedRoute>
                            <AdminLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="chat" element={<AdminChatHistory />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="categories/new" element={<CategoryForm />} />
                        <Route path="categories/edit/:id" element={<CategoryForm />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        <Route path="orders" element={<Orders />} />
                    </Route>

                    {/* Client Routes */}
                    <Route path="/" element={
                        <>
                            <Navbar />
                            <AuthCheck>
                                <Home />
                            </AuthCheck>
                            <Footer />
                        </>
                    } />
                    <Route path="/products" element={
                        <>
                            <Navbar />
                            <AuthCheck>
                                <Products />
                            </AuthCheck>
                            <Footer />
                        </>
                    } />
                    <Route path="/category/:categoryId" element={
                        <>
                            <Navbar />
                            <AuthCheck>
                                <CategoryProducts />
                            </AuthCheck>
                            <Footer />
                        </>
                    } />
                    <Route path="/product/:id" element={
                        <>
                            <Navbar />
                            <AuthCheck>
                                <ProductDetail />
                            </AuthCheck>
                            <Footer />
                        </>
                    } />
                    <Route path="/cart" element={
                        <>
                            <Navbar />
                            <AuthCheck>
                                <Cart />
                            </AuthCheck>
                            <Footer />
                        </>
                    } />
                    <Route path="/checkout" element={
                        <>
                            <Navbar />
                            <AuthCheck>
                                <Checkout />
                            </AuthCheck>
                            <Footer />
                        </>
                    } />
                    <Route path="/order-success" element={
                        <>
                            <Navbar />
                            <OrderSuccess />
                            <Footer />
                        </>
                    } />
                    <Route path="auth" element={<Auth />}>
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                    </Route>

                    {/* Not Found Route */}
                    {/* <Route path="*" element={<Error />} /> */}
                </Routes>
                <Toaster />
                <Chatbot customerId={customerId}/>
            </BrowserRouter>
        </CartProvider>
    );
};

export default MainLayout;