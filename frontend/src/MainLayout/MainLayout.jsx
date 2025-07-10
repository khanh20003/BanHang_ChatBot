import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { UserProvider } from "../context/UserContext";
import Navbar from './../Components/Navbar/Navbar';
import { useUser } from '../context/UserContext';

function DynamicChatbot() {
    const { customerId } = useUser();
    return <Chatbot customerId={customerId} />;
}
import Home from "../Pages/Home/Home";
import Auth from "../Pages/Auth/Auth";
import Login from "../Pages/Auth/Login/Login";
import Register from "../Pages/Auth/Register/Register";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import ResetPassword from "../Pages/Auth/ResetPassword";
import Error from "../Pages/Error/Error";
import AuthCheck from "../AuthCheck/AuthCheck";
import Footer from "../Components/Footer/Footer";
import Brand from "../Components/Brand/Brand";

import ProductDetail from "../Pages/ProductDetail/ProductDetail";
import Cart from "../Pages/Cart/Cart";
import Products from "../Pages/Products/Products";
import ProductForm from "../admin/pages/ProductForm";   
import CategoryProducts from "../Pages/CategoryProducts/CategoryProducts";
import Checkout from "../Pages/Checkout/Checkout";
import OrderSuccess from "../Pages/OrderSuccess";
import About from "../Pages/About/About";
import Contact from "../Pages/Contact/Contact";
import OrderTracking from '../Pages/OrderTracking';
import MyOrder from '../Pages/MyOrders';
import UserSidebar from '../Pages/UserSidebar';

import { CartProvider } from "../context/CartContext";
import { Toaster } from "react-hot-toast";
import Wishlist from "../Pages/Wishlist/Wishlist";
import { WishlistProvider } from "../context/WishlistContext";

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
import Profile from "../Pages/Profile/Profile";


const MainLayoutContent = () => {
    const location = useLocation();
    const isAdmin = location.pathname.startsWith("/admin");

    return (
        <>
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
                <Route path="/about" element={
                    <>
                        <Navbar />
                        <About />
                        <Footer />
                    </>
                } />
                <Route path="/contact" element={
                    <>
                        <Navbar />
                        <Contact />
                        <Footer />
                    </>
                } />
                <Route path="/wishlist" element={
                    <>
                        <Navbar />
                        <AuthCheck>
                            <Wishlist />
                        </AuthCheck>
                        <Footer />
                    </>
                } />
                <Route path="/profile" element={
                    <>
                        <Navbar />
                        <Profile />
                        <Footer />
                    </>
                } />
                <Route path="/orders/:id/track" element={
                    <>
                        <Navbar />
                        <AuthCheck>
                            <OrderTracking />
                        </AuthCheck>
                        <Footer />
                    </>
                } />
                <Route path="/my-orders" element={
                    <>
                        <Navbar />
                        <AuthCheck>
                            <MyOrder />
                        </AuthCheck>
                        <Footer />
                    </>
                } />

                {/* Admin Routes */}
                <Route path="auth" element={<Auth />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                </Route>

                {/* Not Found Route */}
                {/* <Route path="*" element={<Error />} /> */}
            </Routes>
            <Toaster />
            {/* Lấy customerId động từ context để truyền vào Chatbot */}
            {!isAdmin && <DynamicChatbot />}
        </>
    );
};

const MainLayout = () => {
    return (
        <UserProvider>
            <CartProvider>
                <WishlistProvider>
                    <BrowserRouter>
                        <MainLayoutContent />
                    </BrowserRouter>
                </WishlistProvider>
            </CartProvider>
        </UserProvider>
    );
};

export default MainLayout;