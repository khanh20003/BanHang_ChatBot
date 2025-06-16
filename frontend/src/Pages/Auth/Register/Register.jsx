import { MoveRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-hot-toast";
import authService from "../../../services/authService";
import { useUser } from "../../../context/UserContext";

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const navigate = useNavigate();
    const { setCustomerId } = useUser();

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePhone = (phone) => /^\d{9,11}$/.test(phone);

    const submitHandle = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (!form.username || !form.email || !form.full_name || !form.phone || !form.address || !form.password || !form.confirm_password) {
            setError("Vui lòng nhập đầy đủ thông tin");
            setLoading(false);
            return;
        }
        if (!validateEmail(form.email)) {
            setError("Email không hợp lệ");
            setLoading(false);
            return;
        }
        if (!validatePhone(form.phone)) {
            setError("Số điện thoại không hợp lệ");
            setLoading(false);
            return;
        }
        if (form.password.length < 6) {
            setError("Mật khẩu phải từ 6 ký tự trở lên");
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0e7ff] to-[#f0fdfa] py-8 px-2">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-3xl text-[#272343] font-bold mb-6 text-center">Đăng ký tài khoản</h3>
                <form onSubmit={submitHandle} className="flex flex-col gap-4">
                    <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Tên đăng nhập" className="input-auth" autoComplete="username" />
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input-auth" autoComplete="email" />
                    <input type="text" name="full_name" value={form.full_name} onChange={handleChange} placeholder="Họ và tên" className="input-auth" />
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="Số điện thoại" className="input-auth" />
                    <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Địa chỉ" className="input-auth" />
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Mật khẩu" className="input-auth pr-10" autoComplete="new-password" />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="relative">
                        <input type={showConfirm ? "text" : "password"} name="confirm_password" value={form.confirm_password} onChange={handleChange} placeholder="Xác nhận mật khẩu" className="input-auth pr-10" autoComplete="new-password" />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button type="submit" className="w-full h-[50px] bg-[#007580] rounded-lg text-base text-white font-semibold flex items-center justify-center gap-2.5 transition hover:bg-[#005f63] disabled:opacity-60" disabled={loading}>{loading ? <span className="animate-spin mr-2 w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span> : null}Đăng ký <MoveRight /></button>
                </form>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-4 text-center animate-pulse">{error}</div>}
                <p className="text-base text-[#272343] font-normal flex items-center justify-center gap-2.5 mt-6">Đã có tài khoản? <Link to={'/auth/login'} className="text-[#007580] font-semibold hover:underline">Đăng nhập</Link></p>
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
                    color: #222; /* Đặt màu chữ nhập vào là đen */
                }
                .input-auth:focus {
                    border: 1.5px solid #007580;
                    background: #fff;
                }
                .input-auth::placeholder {
                    color: #9ca3af;
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

export default Register;