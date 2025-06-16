import React, { useEffect, useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="p-6 bg-white rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-sm">
        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        <span className="text-green-500">{trend}%</span>
        <span className="text-gray-500 ml-1">from last month</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://127.0.0.1:8000/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        setStats([
          {
            title: 'Total Revenue',
            value: `$${data.total_revenue.toLocaleString()}`,
            icon: DollarSign
          },
          {
            title: 'Total Users',
            value: data.total_users.toLocaleString(),
            icon: Users
          },
          {
            title: 'Total Products',
            value: data.total_products.toLocaleString(),
            icon: ShoppingBag
          }
        ]);
        setRecentActivity(data.recent_activity || []);
        setMonthlyRevenue(data.monthly_revenue || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Chuyển đổi dữ liệu doanh thu tháng cho biểu đồ
  const chartData = monthlyRevenue.map(item => ({
    name: `${item.month}/${item.year}`,
    revenue: item.revenue
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tổng quan hiệu suất cửa hàng của bạn
        </p>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Biểu đồ tăng trưởng doanh thu</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={v => v.toLocaleString()} />
                <Tooltip formatter={v => v.toLocaleString()} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Doanh thu" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h2>
              <div className="mt-6 space-y-4">
                {recentActivity.length === 0 && (
                  <div className="text-gray-500">Không có hoạt động gần đây.</div>
                )}
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'user_registration' ? 'Người dùng mới đăng ký' : activity.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.user_name ? `${activity.user_name} vừa tham gia hệ thống` : ''}
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-gray-500">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;