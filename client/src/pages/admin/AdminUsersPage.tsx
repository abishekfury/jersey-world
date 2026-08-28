import React, { useState, useEffect } from 'react';
import { Users, Shield, Lock, Trash2, UserCheck, UserX } from 'lucide-react';
import { adminService } from '../../services/api';
import { IUser } from '@shared/types';
import { addToast } from '../../store/uiSlice';
import { useAppDispatch } from '../../store';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  const loadUsers = () => {
    adminService
      .getUsers()
      .then((res) => setUsers(res.data.users))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminService.updateUserRole(userId, role);
      dispatch(addToast({ type: 'success', message: 'User role updated successfully!' }));
      loadUsers();
    } catch (err: any) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Failed to update role.' }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-black font-display uppercase tracking-tight">
            CUSTOMER DIRECTORY & ROLE MANAGEMENT
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Manage customer accounts, inspect daily AI fitting usage, and assign Administrator privileges
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="text-[10px] uppercase font-bold bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Account Status</th>
                <th className="p-4">Daily AI Try-Ons</th>
                <th className="p-4 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((usr) => (
                <tr key={usr._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-black flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                      {usr.name.charAt(0)}
                    </div>
                    {usr.name}
                  </td>
                  <td className="p-4 text-gray-600 font-mono">{usr.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      usr.role === 'admin'
                        ? 'bg-black text-white'
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {usr.role === 'admin' ? 'Administrator' : 'Active Customer'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-medium text-black">
                    {usr.dailyTryOnCount || 0} / 5 used
                  </td>
                  <td className="p-4 text-right">
                    <select
                      value={usr.role}
                      onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                      className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-black font-semibold focus:border-black focus:outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
