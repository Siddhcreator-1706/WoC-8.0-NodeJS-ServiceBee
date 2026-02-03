import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                setError('Failed to fetch users');
            }
        } catch (error) {
            setError('Error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const res = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Navbar */}
            <nav className="px-6 py-4 flex justify-between items-center border-b border-purple-500/20">
                <Link to="/">
                    <h1 className="text-2xl font-bold text-green-400" style={{ fontFamily: 'Creepster, cursive' }}>
                        🔮 Superuser Panel
                    </h1>
                </Link>
                <div className="flex gap-4 items-center">
                    <Link to="/admin" className="text-purple-400 hover:text-purple-300">Admin Panel</Link>
                    <span className="text-gray-300">{user?.name}</span>
                    <button onClick={logout} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">Logout</button>
                </div>
            </nav>

            <div className="p-6">
                <h2 className="text-2xl text-white font-bold mb-6">User Management</h2>

                {error && <div className="text-red-400 mb-4">{error}</div>}

                {loading ? (
                    <div className="text-gray-400">Loading...</div>
                ) : (
                    <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-green-500/10">
                                <tr className="text-left text-gray-300">
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u._id} className="border-t border-purple-500/10 text-gray-300">
                                        <td className="p-4">{u.name}</td>
                                        <td className="p-4">{u.email}</td>
                                        <td className="p-4">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className="bg-gray-700 text-white px-2 py-1 rounded"
                                                disabled={u._id === user?._id}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="superuser">Superuser</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            {u._id !== user?._id && (
                                                <button
                                                    onClick={() => handleDelete(u._id)}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
