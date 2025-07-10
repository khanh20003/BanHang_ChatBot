import { useEffect, useState } from "react";
import authService from "../../services/authService";
import axios from "axios";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import UserSidebar from "../UserSidebar";
import { Menu, X } from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setForm({
        full_name: currentUser.full_name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        avatar: currentUser.avatar || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const user = authService.getCurrentUser();
      const token = user?.access_token;
      const res = await axios.post("http://127.0.0.1:8000/user/upload-avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedUser = { ...user, avatar: res.data.avatar_url };
      setForm({ ...form, avatar: res.data.avatar_url });
      setUser(updatedUser);
      authService.updateCurrentUser(updatedUser);
      toast.success("Upload ảnh đại diện thành công!");
    } catch (err) {
      console.error("Upload avatar failed:", err);
      toast.error("Upload ảnh đại diện thất bại!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = authService.getCurrentUser();
      const token = user?.access_token;
      if (!token) {
        toast.error("Không có token, vui lòng đăng nhập lại.");
        setLoading(false);
        return;
      }

      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        avatar: form.avatar,
      };

      const res = await axios.put(
        "http://127.0.0.1:8000/user/profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = res.data;
      setUser(updatedUser); // Cập nhật state user
      setForm({
        full_name: updatedUser.full_name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        avatar: updatedUser.avatar || "",
      }); // Cập nhật form state để giao diện phản ánh ngay
      authService.updateCurrentUser(updatedUser); // Cập nhật localStorage
      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/auth/login";
      } else {
        toast.error("Cập nhật thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-16 text-center text-gray-600 dark:text-gray-300 text-lg">
        Vui lòng đăng nhập để xem hồ sơ của bạn.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="flex gap-8 flex-col lg:flex-row">
        <div className="hidden lg:block lg:w-64">
          <UserSidebar />
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              <UserSidebar />
              <button
                className="absolute top-4 right-4 text-gray-600 dark:text-gray-200"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-gray-200/20 dark:border-gray-700/20"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">Hồ Sơ Của Tôi</h2>
            <button
              className="lg:hidden text-gray-600 dark:text-gray-200"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200 text-lg">Ảnh Đại Diện</label>
                {form.avatar ? (
                  <img
                    src={`http://127.0.0.1:8000${form.avatar}`}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover mb-4 border-2 border-teal-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <span className="text-gray-500 dark:text-gray-400">No Avatar</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white hover:file:bg-teal-600"
                />
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200 text-lg">Họ và Tên</label>
                  <motion.input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full bg-white/70 dark:bg-gray-700/70 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    whileFocus={{ scale: 1.02 }}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200 text-lg">Email</label>
                  <motion.input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-gray-100/70 dark:bg-gray-600/70 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 cursor-not-allowed"
                    disabled
                    placeholder="Nhập email"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200 text-lg">Số Điện Thoại</label>
                  <motion.input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full bg-white/70 dark:bg-gray-700/70 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    whileFocus={{ scale: 1.02 }}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-200 text-lg">Địa Chỉ</label>
                  <motion.input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full bg-white/70 dark:bg-gray-700/70 rounded-lg px-4 py-3 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    whileFocus={{ scale: 1.02 }}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>
            </div>
            <motion.button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-300"
              disabled={loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Đang Lưu..." : "Lưu Thay Đổi"}
            </motion.button>
          </form>
        </motion.main>
      </div>
    </div>
  );
};

export default Profile;