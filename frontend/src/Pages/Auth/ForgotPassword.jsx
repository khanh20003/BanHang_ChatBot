import { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiMail, FiKey, FiLock } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập otp, 3: đổi mật khẩu
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Validate functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);

  // Hàm gửi request chung
  const sendRequest = async (url, body) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Yêu cầu thất bại!");
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Vui lòng nhập email hợp lệ!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendRequest("http://127.0.0.1:8000/auth/forgot-password", { email });
      toast.success("Mã OTP đã được gửi về email của bạn.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Không gửi được mã OTP!");
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Mã OTP phải là 6 chữ số!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendRequest("http://127.0.0.1:8000/auth/verify-otp", { email, otp });
      toast.success("Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Mã OTP không đúng hoặc đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Đổi mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!validatePassword(password)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và ký tự đặc biệt!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Chỉ gửi email và password, vì OTP đã được xác minh
      await sendRequest("http://127.0.0.1:8000/auth/reset-password", { email, password });
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/auth/login");
    } catch (err) {
      setError(err.message || "Đặt lại mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 to-blue-100 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-teal-200/50"
        role="region"
        aria-label="Form quên mật khẩu"
      >
        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
          Quên / Đặt lại mật khẩu
        </h3>
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" aria-hidden="true" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Nhập email của bạn..."
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all duration-300"
                required
                disabled={loading}
                aria-label="Email"
              />
            </div>
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Gửi mã OTP"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang gửi...
                </span>
              ) : (
                "Gửi mã OTP"
              )}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="relative">
              <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" aria-hidden="true" />
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError("");
                }}
                placeholder="Nhập mã OTP (6 chữ số)"
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all duration-300"
                required
                disabled={loading}
                maxLength={6}
                aria-label="Mã OTP"
              />
            </div>
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Xác thực OTP"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xác thực...
                </span>
              ) : (
                "Xác thực OTP"
              )}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" aria-hidden="true" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Mật khẩu mới"
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all duration-300"
                required
                disabled={loading}
                aria-label="Mật khẩu mới"
              />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" aria-hidden="true" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                placeholder="Xác nhận mật khẩu mới"
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all duration-300"
                required
                disabled={loading}
                aria-label="Xác nhận mật khẩu"
              />
            </div>
            {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Đặt lại mật khẩu"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </span>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>
          </form>
        )}
        <p className="text-center text-gray-600 mt-4">
          <Link to="/auth/login" className="text-teal-500 hover:underline" aria-label="Quay lại đăng nhập">
            Quay lại đăng nhập
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;