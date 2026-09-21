import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, MapPin, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store';
import { logoutUser } from '../../store/authSlice';
import { SEO } from '../seo/SEO';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const tabs = [
    { label: 'Order History', path: '/account/orders', icon: <ShoppingBag className="w-4 h-4" /> },
    { label: 'Wishlist', path: '/account/wishlist', icon: <Heart className="w-4 h-4" /> },
    { label: 'Saved Addresses', path: '/account/addresses', icon: <MapPin className="w-4 h-4" /> },
    { label: 'Profile & Security', path: '/account/profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEO title="My Account" noIndex={true} />
      {/* Account Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center text-white font-display font-black text-2xl shadow">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">{user?.name}</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                {user?.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => dispatch(logoutUser())}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 text-xs font-bold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          SIGN OUT
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-gray-200">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-black text-white shadow'
                  : 'bg-gray-50 text-gray-700 hover:text-black hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
};
