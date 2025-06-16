import { MoveRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import authService from "../../../services/authService";
import { toast } from "react-toastify";
import { useUser } from "../../../context/UserContext";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { setCustomerId } = useUser();
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const submitHandle = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            if (!formData.username || !formData.password) {
                setError("Vui lòng nhập đầy đủ thông tin");
                setLoading(false);
                return;
            }
            const userData = await authService.login(formData.username, formData.password);
            if (userData && userData.id) {
                setCustomerId(userData.id.toString());
            }
            toast.success("Đăng nhập thành công!");
            navigate('/');
        } catch (error) {
            setError(error.detail || "Đăng nhập thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] to-[#f0fdfa] py-8 px-2">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-3xl text-[#272343] font-bold mb-6 text-center">Đăng nhập</h3>
                <form onSubmit={submitHandle} className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Tên đăng nhập"
                        className="input-auth"
                        autoComplete="username"
                    />
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Mật khẩu"
                            className="input-auth pr-10"
                            autoComplete="current-password"
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-[50px] bg-[#007580] rounded-lg text-base text-white font-semibold flex items-center justify-center gap-2.5 transition hover:bg-[#005f63] disabled:opacity-60"
                    >
                        {loading ? <span className="animate-spin mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : null}
                        Đăng nhập <MoveRight />
                    </button>
                </form>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-4 text-center animate-pulse">{error}</div>}
                <p className="text-base text-[#272343] font-normal flex items-center justify-center gap-2.5 mt-6">
                    Chưa có tài khoản? <Link to={'/auth/register'} className="text-[#007580] font-semibold hover:underline">Đăng ký</Link>
                </p>
            </div>
            <style>{`
                .input-auth {
                    width: 100%;
                    height: 48px;
                    background: #f0f2f3;
                    border-radius: 8px;
                    padding-left: 14px;
                    font-size: 16px;
                    border: 1px solid #e5e7eb;
                    outline: none;
                    margin-bottom: 0;
                    transition: border 0.2s;
                }
                .input-auth:focus {
                    border: 1.5px solid #007580;
                    background: #fff;
                }
            `}</style>
        </div>
    );
};

export default Login;