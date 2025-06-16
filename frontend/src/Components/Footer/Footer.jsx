import { Armchair, Banknote, CreditCard, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';

const Footer = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:8000/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    return (
        <footer className="bg-white border-t border-[#e1e3e5] pt-16 pb-8 mt-12 shadow-[0_-2px_24px_#e1e3e5]/40">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    <div>
                        <div className="logo_wrapper mb-7">
                            <Link to='/' className="text-3xl text-[#272343] font-inter font-bold capitalize flex items-center gap-2"><Armchair size='2rem' color="#029fae" /> Device</Link>
                        </div>
                        <p className="text-base text-[#555] font-inter font-normal mb-4 max-w-[350px]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus repellat vero nulla! Quibusdam, reiciendis maiores fugiat atque aliquam molestiae vero?</p>
                        <div className="footer_social flex items-center gap-3 mt-4">
                            <Link className="p-3 rounded-full border border-[#007580] bg-white hover:bg-[#007580] hover:text-white transition-colors shadow" to="#"><Facebook size='1.5rem' /></Link>
                            <Link className="p-3 rounded-full border border-[#007580] bg-white hover:bg-[#007580] hover:text-white transition-colors shadow" to="#"><Twitter size='1.5rem' /></Link>
                            <Link className="p-3 rounded-full border border-[#007580] bg-white hover:bg-[#007580] hover:text-white transition-colors shadow" to="#"><Instagram size='1.5rem' /></Link>
                            <Link className="p-3 rounded-full border border-[#007580] bg-white hover:bg-[#007580] hover:text-white transition-colors shadow" to="#"><Youtube size='1.5rem' /></Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg text-[#007580] font-inter font-semibold uppercase mb-4 tracking-wide">Danh mục</h3>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <Link to={`/category/${category.id}`} className="text-base text-[#272343] font-inter font-normal capitalize hover:text-[#007580] transition-colors">
                                        {category.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg text-[#007580] font-inter font-semibold uppercase mb-4 tracking-wide">Hỗ trợ</h3>
                        <ul className="space-y-2">
                            <li><Link className="text-base text-[#272343] font-inter font-normal capitalize hover:text-[#007580] transition-colors">Trợ giúp</Link></li>
                            <li><Link className="text-base text-[#272343] font-inter font-normal capitalize hover:text-[#007580] transition-colors">Điều khoản</Link></li>
                            <li><Link className="text-base text-[#272343] font-inter font-normal capitalize hover:text-[#007580] transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link className="text-base text-[#272343] font-inter font-normal capitalize hover:text-[#007580] transition-colors">Hỗ trợ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg text-[#007580] font-inter font-semibold uppercase mb-4 tracking-wide">Đăng ký nhận tin</h3>
                        <form action="#" className="flex flex-col gap-3">
                            <input type="email" placeholder="Nhập email của bạn..." className="w-full h-[46px] border border-[#e1e3e5] rounded-lg pl-3 focus:border-[#007580] outline-none" />
                            <button type="submit" className="text-base text-white font-semibold capitalize w-full h-[46px] bg-gradient-to-r from-[#029fae] to-[#007580] rounded-lg cursor-pointer shadow hover:opacity-90 transition">Đăng ký</button>
                        </form>
                    </div>
                </div>
            </div>
            <div className="w-full border-t border-[#e1e3e5] mt-10 pt-6 pb-2 bg-white">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-base text-[#9a9caa] font-normal font-inter">© 2025 Device - Designed & Developed by <span className="text-[#007580] font-semibold">Lifeonthecode</span></p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-[#9a9caa] text-lg"><Banknote size='1.5rem' /> Bank Note</span>
                        <span className="flex items-center gap-2 text-[#9a9caa] text-lg"><CreditCard size='1.5rem' /> Credit Card</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;