import { Armchair, Check, Heart, Info, Menu, Search, ShoppingCart, User, LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../../services/authService';

const Navbar = () => {
    const { cart } = useCart();
    const itemCount = cart?.cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
    const [categories, setCategories] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchCategories();
        const user = authService.getCurrentUser();
        console.log('Current user:', user); // Kiểm tra dữ liệu user
        if (user) {
            setCurrentUser(user);
        } else {
            setCurrentUser(null);
        }
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    return (
        <div>
            {/* nabvar top  */}
            <div className="navbar_top flex items-center justify-center bg-white h-[45px] w-full border-b border-[#e1e3e5]">
                <div className="lg:container flex justify-between items-center">
                    <p className="flex items-center gap-2 text-sm font-inter font-normal text-[#272343] capitalize">
                        <Check className="text-[#029fae]" /> Free on all orders over $50
                    </p>

                    <div className="navbar_top_right flex items-center gap-6">
                        <select defaultValue="Server location" className="bg-none h-[30px] w-[70px] text-sm font-inter font-normal capitalize text-[#272343]">
                            <option>eng</option>
                            <option>vietnamese</option>
                        </select>

                        <Link to="/faqs" className="text-sm text-[#272343] font-inter font-normal capitalize">Faqs</Link>
                        <Link to="/help" className="flex items-center text-sm text-[#272343] font-inter font-normal capitalize">
                            <Info className="text-[#029fae]" /> need help
                        </Link>
                    </div>
                </div>
            </div>

            {/* navbar middle  */}
            <div className="navbar_middle flex items-center justify-center bg-[#f0f2f3] w-full h-[84px]">
                <div className="lg:container grid grid-cols-3 items-center">
                    <div className="logo_wrapper">
                        <Link to='/' className="text-3xl text-black font-inter font-medium capitalize flex items-center gap-2">
                            <Armchair size='2rem' color="#029fae" /> Device
                        </Link>
                    </div>

                    <div className="search_box">
                        <form action="#" className="max-w-[443px] h-[44px] relative">
                            <input type="text" placeholder="Search here..." className="max-w-[443px] w-full h-full bg-white rounded-lg pl-4" />
                            <button className="absolute to-50% right-4 translate-y-1/2">
                                <Search size='22px' color="#272343" />
                            </button>
                        </form>
                    </div>

                    {/* navbar middle right  */}
                    <div className="navbar_middle_right flex items-center gap-4">
                        <Link to="/cart" className="btn capitalize relative">
                            <ShoppingCart /> cart
                            {itemCount > 0 && (
                                <div className="absolute -top-2 -right-2 bg-[#029fae] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </div>
                            )}
                        </Link>
                        <Link to="/wishlist" className="btn capitalize">
                            <Heart />
                        </Link>

                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn m-1"><User /></div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                {currentUser ? (
                                    <>
                                        <li className="px-4 py-2 text-gray-700">
                                            {currentUser.username || currentUser.email || 'User'}
                                        </li>
                                        <li>
                                            <button onClick={handleLogout} className="flex items-center text-red-600">
                                                <LogOut size={16} className="mr-2" />
                                                Logout
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link to="/auth/login">Login</Link></li>
                                        <li><Link to="/auth/register">Register</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* navbar bottom  */}
            <div className="navbar_bottom flex items-center justify-center w-full h-[75px] bg-white border-b-[1px] border-[#e1e3e5]">
                <div className="lg:container flex items-center justify-between">
                    <div className="navbar_bottom_left flex items-center gap-8">
                        <div className="dropdown dropdown-start">
                            <div tabIndex={0} role="button" className="btn m-1 flex items-center gap-5 capitalize">
                                <Menu /> all categories
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <Link to={`/category/${category.id}`}>{category.title}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <nav className="flex items-center gap-8">
                            <NavLink to='/' className={({isActive}) => 
                                `text-sm font-inter font-medium capitalize ${isActive ? 'text-[#029fae]' : 'text-[#636270]'}`
                            }>Home</NavLink>
                            <NavLink to='/products' className={({isActive}) => 
                                `text-sm font-inter font-medium capitalize ${isActive ? 'text-[#029fae]' : 'text-[#636270]'}`
                            }>Products</NavLink>
                            <NavLink to='/cart' className={({isActive}) => 
                                `text-sm font-inter font-medium capitalize ${isActive ? 'text-[#029fae]' : 'text-[#636270]'}`
                            }>Cart</NavLink>
                            <NavLink to='/about' className={({isActive}) => 
                                `text-sm font-inter font-medium capitalize ${isActive ? 'text-[#029fae]' : 'text-[#636270]'}`
                            }>About</NavLink>
                            <NavLink to='/contact' className={({isActive}) => 
                                `text-sm font-inter font-medium capitalize ${isActive ? 'text-[#029fae]' : 'text-[#636270]'}`
                            }>Contact</NavLink>
                        </nav>
                    </div>

                    <div className="navbar_bottom_right">
                        <p className="text-sm text-[#636270] font-inter font-normal capitalize">
                            contact: <span className="text-[#272343]">0838 610 344</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;