import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Users,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { useAppSelector } from '../../store';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Strict Admin Gate: Only role === 'admin'
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const links = [
    { label: 'Overview & Sales', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Products & Inventory', path: '/admin/products', icon: <Shirt className="w-4 h-4" /> },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Customer Management', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-black text-white text-sm shadow">
              JW
            </div>
            <div>
              <h2 className="font-display font-black text-sm uppercase text-black tracking-tight">
                ADMIN PORTAL
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                  <Shield className="w-3 h-3" /> Full Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-md'
                      : 'text-gray-600 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin User Info & Store Link */}
        <div className="pt-6 border-t border-gray-200 mt-6 space-y-3">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-[11px] font-bold text-black truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Store
          </Link>
        </div>
      </aside>

      {/* Main Admin View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};
