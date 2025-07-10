import { MoveRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../../../services/authService";
import { toast } from "react-toastify";
import { useUser } from "../../../context/UserContext";
import { motion } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const { setCustomerId } = useUser();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const submitHandle = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userData = await authService.login(formData.username, formData.password);
            if (userData && userData.id) {
                setCustomerId(userData.id.toString());
            }
            toast.success("Đăng nhập thành công!");
            navigate('/');
        } catch (error) {
            toast.error(error.detail || "Đăng nhập thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lg:container mx-auto p-20 bg-gradient-to-br from-teal-500/10 to-blue-600/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-[648px] w-full min-h-[382px] p-8 mx-auto flex items-center justify-center flex-col rounded-xl border border-gray-200/30 dark:border-gray-700/30 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md shadow-lg"
            >
                <h3 className="text-3xl text-gray-800 dark:text-white font-semibold font-inter mb-6 capitalize">Login</h3>
                <form onSubmit={submitHandle} className="grid grid-cols-1 gap-4 w-full">
                    <motion.input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Username..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Your Password..."
                        className="w-full h-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-4 focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        whileFocus={{ scale: 1.02 }}
                        required
                    />
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg flex items-center justify-center gap-2.5 hover:bg-teal-600 transition-all duration-200 disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {loading ? "Đang đăng nhập..." : "Login"} <MoveRight size={20} />
                    </motion.button>
                </form>
                <p className="text-base text-gray-700 dark:text-gray-300 font-inter flex items-center justify-center gap-2.5 mt-4">
                    Don't have an account? <Link to="/auth/register" className="text-teal-500 hover:underline">Register</Link>
                </p>
                <p className="text-sm text-teal-600 dark:text-teal-400 text-center mt-2">
                    <Link to="/auth/forgot-password" className="hover:underline">Quên mật khẩu?</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;