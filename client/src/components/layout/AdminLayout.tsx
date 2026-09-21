import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  ShoppingBag,
  Users,
  Tag,
  ArrowLeft,
  Shield,
  Star,
  Layers,
} from 'lucide-react';
import { useAppSelector } from '../../store';
import { SEO } from '../seo/SEO';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Strict Admin Gate: Only role === 'admin'
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const links = [
    { label: 'Overview & Sales', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Jerseys & Homepage Kits', path: '/admin/products', icon: <Shirt className="w-5 h-5" /> },
    { label: 'Homepage Banners & Coupons', path: '/admin/coupons', icon: <Tag className="w-5 h-5" /> },
    { label: 'Categories & Teams', path: '/admin/categories', icon: <Layers className="w-5 h-5" /> },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Review Moderation', path: '/admin/reviews', icon: <Star className="w-5 h-5" /> },
    { label: 'Customer Management', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-black flex flex-col md:flex-row font-sans">
      <SEO title="Admin Portal" noIndex={true} />
      {/* Admin Sidebar (Sticky so profile card and back to store link are always in view) */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col justify-between shrink-0 shadow-sm md:sticky md:top-0 md:h-screen">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center font-black text-white text-base shadow-sm">
              JW
            </div>
            <div>
              <h2 className="font-display font-black text-base uppercase text-black tracking-tight">
                ADMIN PORTAL
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-2.5 py-1 rounded-md bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20">
                  <Shield className="w-3.5 h-3.5" /> Full Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'text-gray-700 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin User Info & Store Link */}
        <div className="pt-6 border-t border-gray-200 mt-6 space-y-4">
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm font-bold text-black truncate">{user?.name || 'Alexander Sterling'}</p>
            <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{user?.email || 'admin@jerseyworld.com'}</p>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2.5 text-sm font-bold text-gray-700 hover:text-black transition-colors px-1"
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

