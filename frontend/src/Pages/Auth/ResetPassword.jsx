import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Lấy token từ URL
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (!validatePassword(password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và ký tự đặc biệt!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Đặt lại mật khẩu thất bại!');
      toast.success('Đặt lại mật khẩu thành công!');
      navigate('/auth/login');
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra!');
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
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
          Đặt lại mật khẩu
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            className="relative"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Mật khẩu mới"
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all duration-300"
              required
            />
          </motion.div>
          <motion.div
            className="relative"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setError('');
              }}
              placeholder="Xác nhận mật khẩu mới"
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all duration-300"
              required
            />
          </motion.div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-blue-700 transition-all duration-300 shadow-md"
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;