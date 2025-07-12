import React, { useEffect, useState } from 'react';
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-800 uppercase tracking-wide">{title}</p>
        <p className="mt-3 text-3xl font-bold text-black">{value}</p>
      </div>
      <div className="p-3 bg-indigo-200 rounded-full">
        <Icon className="w-8 h-8 text-indigo-700" />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center text-md">
        <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
        <span className="text-green-600 font-semibold">{trend}%</span>
        <span className="text-gray-500 ml-1">from last month</span>
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [timeRange, setTimeRange] = useState('12'); // Mặc định 12 tháng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://127.0.0.1:8000/admin/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        setStats([
          { title: 'Total Revenue', value: `$${data.total_revenue.toLocaleString()}`, icon: DollarSign, trend: 5 },
          { title: 'Total Users', value: data.total_users.toLocaleString(), icon: Users, trend: 3 },
          { title: 'Total Products', value: data.total_products.toLocaleString(), icon: ShoppingBag, trend: 7 },
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

  const chartData = monthlyRevenue
    .slice(-timeRange) // Lấy dữ liệu theo khoảng thời gian đã chọn
    .map(item => ({
      name: `${item.month}/${item.year}`,
      revenue: item.revenue,
    }));

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-100 min-h-screen">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900 drop-shadow-md">Dashboard</h1>
        <p className="mt-2 text-md text-gray-600">Overview of your store performance</p>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl">{error}</div>
      )}
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Revenue Trend</h2>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-md focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all"
              >
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
                <option value="24">Last 24 Months</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} stroke="#666" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#colorUv)" fillOpacity={0.3} />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-gray-500 text-center py-4">No recent activity.</div>
              ) : (
                recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-md font-medium text-gray-900">{activity.type === 'user_registration' ? 'New User Registered' : activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.user_name ? `${activity.user_name} joined` : ''}</p>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;