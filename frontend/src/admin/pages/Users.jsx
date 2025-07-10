import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, UserPlus, Mail, Shield, Clock } from 'lucide-react';

const UserTable = ({ users, onEdit, onDelete }) => (
  <div className="mt-6 overflow-x-auto bg-white rounded-xl shadow-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
          <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {users.map((user) => (
          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="h-12 w-12 flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full object-cover border-2 border-indigo-200 hover:border-indigo-400 transition-all"
                    src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `http://127.0.0.1:8000${user.avatar}`) : '/default-avatar.png'}
                    alt={user.name || user.email}
                  />
                </div>
                <div className="ml-4">
                  <div className="text-md font-medium text-gray-900">{user.name}</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-md text-gray-900">{user.email}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                {user.is_admin ? "Admin" : "User"}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-md text-gray-600">
              {user.created_at ? new Date(user.created_at).toLocaleString() : user.joined_at ? new Date(user.joined_at).toLocaleString() : user.date_joined ? new Date(user.date_joined).toLocaleString() : ''}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-md font-medium">
              
              <button onClick={() => onDelete(user.id)} className="text-red-600 hover:text-red-900 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Users = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) { window.location.href = '/admin/login'; return; }
        const response = await fetch('http://127.0.0.1:8000/admin/users', {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (response.status === 401) { localStorage.removeItem('adminToken'); window.location.href = '/admin/login'; return; }
        if (!response.ok) throw new Error(await response.json().catch(() => null)?.detail || 'Failed to fetch users');
        setUsers(await response.json());
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    }; fetchUsers();
  }, []);

  const roles = [{ id: 'all', name: 'All Roles' }, { id: 'admin', name: 'Admin' }, { id: 'user', name: 'User' }];
  const statuses = [{ id: 'all', name: 'All Status' }, { id: 'active', name: 'Active' }, { id: 'inactive', name: 'Inactive' }];

  const handleEdit = (user) => console.log('Edit user:', user);
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://127.0.0.1:8000/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(await response.json().catch(() => null)?.detail || 'Failed to delete user');
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) { alert(err.message || "Delete failed"); }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesRole = true; if (roleFilter === 'admin') matchesRole = user.is_admin === true; else if (roleFilter === 'user') matchesRole = user.is_admin === false;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.is_active : !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Users</h1>
          <p className="mt-2 text-md text-gray-600">Manage your user accounts</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all"
          />
        </div>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none hover:shadow-md transition-all">
            {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
          </select>
        </div>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none hover:shadow-md transition-all">
            {statuses.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
          </select>
        </div>
      </div>
      <UserTable users={filteredUsers} onEdit={handleEdit} onDelete={handleDelete} />
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-6 py-4 rounded-lg shadow-md">
        <div className="flex-1 justify-between sm:hidden">
          <button className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Previous</button>
          <button className="ml-3 px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">Next</button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <p className="text-md text-gray-700">Showing <span className="font-semibold">1</span> to <span className="font-semibold">10</span> of <span className="font-semibold">{users.length}</span> results</p>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
            <button className="px-3 py-2 rounded-l-md bg-gray-100 text-gray-700 hover:bg-gray-200">Previous</button>
            <button className="px-3 py-2 rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200">Next</button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Users;