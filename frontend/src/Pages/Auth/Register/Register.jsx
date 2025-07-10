import { MoveRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";
import authService from "../../../services/authService";
import API_URL from "../../../config/api";
import { useUser } from "../../../context/UserContext";
import { motion } from 'framer-motion';

const Register = () => {
    const [form, setForm] = useState({
        username: "",
        email: "",
        full_name: "",
        phone: "",
        address: "",
        password: "",
        confirm_password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setCustomerId } = useUser();

    const submitHandle = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (!form.username || !form.email || !form.full_name || !form.phone || !form.address || !form.password || !form.confirm_password) {
            setError("Vui lòng nhập đầy đủ thông tin");
            setLoading(false);
            return;
        }
        if (form.password !== form.confirm_password) {
            setError("Mật khẩu xác nhận không khớp");
            setLoading(false);
            return;
        }
        try {
            await authService.register(form);
            setCustomerId(null);
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            navigate("/auth/login");
        } catch (err) {
            setError(err.detail || err.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="lg:container mx-auto p-20 bg-gradient-to-br from-teal-500/10 to-blue-600/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-[648px] w-full min-h-[382px] p-8 mx-auto flex items-center justify-center flex-col rounded-xl border border-gray-200/30 dark:border-gray-700/30 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-lg"
            >
                <h3 className="text-3xl text-gray-800 dark:text-white font-semibold font-inter mb-6 capitalize">Register</h3>
                <form onSubmit={submitHandle} className="grid grid-cols-1 gap-4 w-full">
                    <motion.input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Username..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.input
                        type="text"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        placeholder="Full Name..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Phone..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Address..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.input
                        type="password"
                        name="confirm_password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        placeholder="Confirm Password..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg flex items-center justify-center gap-2.5 hover:bg-teal-600 transition-all duration-200"
                        disabled={loading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? "Đang đăng ký..." : <>Register <MoveRight size={20} /></>}
                    </motion.button>
                </form>
                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                <p className="text-base text-gray-700 dark:text-gray-300 font-inter flex items-center justify-center gap-2.5 mt-4">
                    Already have an account? <Link to="/auth/login" className="text-teal-500 hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;