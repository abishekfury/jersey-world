import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  LogOut,
  Shield,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleCartDrawer } from '../../store/cartSlice';
import { setSearchModalOpen } from '../../store/uiSlice';
import { logoutUser } from '../../store/authSlice';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart.cart);
  const wishlist = useAppSelector((state) => state.wishlist.items);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const totalCartCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'JERSEYS', path: '/shop' },
    { label: 'WORLD CUP SPECIALS', path: '/shop?league=International' },
    { label: 'PREMIUM QUALITY', path: '/shop?type=Player+Version' },
    { label: 'ABOUT US', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 transition-all font-sans w-full">
      {/* Top Free Shipping Announcement Strip */}
      <div className="bg-black text-white text-[10px] sm:text-[11px] py-1.5 px-4 text-center font-sans tracking-widest uppercase font-medium flex items-center justify-center gap-2 select-none border-b border-neutral-800">
        <span className="text-[#FF5722] font-bold">🚚 Free Shipping</span>
        <span className="text-neutral-500">•</span>
        <span className="text-neutral-200">Only on orders above ₹1,499 across India</span>
      </div>

      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo on Left: GOALZA. */}
          <Link
            to="/"
            onClick={(e) => {
              setIsMobileMenuOpen(false);
              if (location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0 cursor-pointer"
            aria-label="GOALZA Home"
          >
            <img
              src="/images/logo.png"
              alt="GOALZA Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-2xl sm:text-3xl font-bold text-black font-sans tracking-wider uppercase">
              GOALZA<span className="text-[#FF5722]">.</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/' && !location.search
                  : location.pathname === link.path.split('?')[0] &&
                    (link.path.includes('?') ? location.search.includes(link.path.split('?')[1]) : true);

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={(e) => {
                    if (link.path === '/' && location.pathname === '/' && !location.search) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`text-xs font-bold tracking-wider uppercase transition-colors font-sans hover:text-[#FF5722] ${
                    isActive ? 'text-black' : 'text-neutral-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Search, Wishlist, Bag, Profile */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <button
              onClick={() => dispatch(setSearchModalOpen(true))}
              className="p-1.5 text-neutral-800 hover:text-black transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Wishlist Link */}
            {!isAdmin && (
              <Link
                to="/wishlist"
                className="relative p-1.5 text-neutral-800 hover:text-black transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.8]" />
                {wishlist.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#FF5722] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Shopping Bag Icon with Count */}
            {!isAdmin && (
              <button
                onClick={() => dispatch(toggleCartDrawer())}
                className="relative p-1.5 text-neutral-800 hover:text-black transition-colors flex items-center gap-1"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                <span className="text-xs font-bold font-mono text-black">
                  {totalCartCount}
                </span>
              </button>
            )}

            {/* Admin Dashboard Shortcut */}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[11px] font-bold uppercase rounded hover:bg-[#FF5722] transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-[#FF5722]" /> Admin
              </Link>
            )}

            {/* Account Profile Avatar / Login */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold font-mono hover:ring-2 hover:ring-black/10 transition-all shadow-xs"
                    aria-label="Account Profile"
                  >
                    {user?.name.charAt(0).toUpperCase()}
                  </button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-xl py-2 z-50 overflow-hidden text-left"
                      >
                        <div className="px-4 py-2 border-b border-neutral-100 bg-neutral-50">
                          <p className="text-xs font-bold text-black truncate">{user?.name}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
                        </div>

                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs text-black hover:bg-neutral-100 font-bold transition-colors"
                          >
                            <Shield className="w-4 h-4 text-[#FF5722]" /> Admin Dashboard
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/account/orders"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 transition-colors"
                            >
                              <Package className="w-4 h-4 text-neutral-500" /> My Orders
                            </Link>
                            <Link
                              to="/account/wishlist"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 transition-colors"
                            >
                              <Heart className="w-4 h-4 text-neutral-500" /> My Wishlist
                            </Link>
                          </>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left border-t border-neutral-100 mt-1 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="w-8 h-8 rounded-full bg-black hover:bg-[#FF5722] text-white flex items-center justify-center text-xs font-bold transition-colors shadow-xs"
                  aria-label="Sign In"
                >
                  <span className="font-bold text-[11px]">IN</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-800 hover:text-black transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white border-b border-neutral-200 px-6 py-5 space-y-3 font-sans overflow-hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={(e) => {
                  setIsMobileMenuOpen(false);
                  if (link.path === '/' && location.pathname === '/' && !location.search) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="block text-sm font-bold uppercase tracking-wider text-neutral-900 hover:text-[#FF5722] py-1.5"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2">
              <Link
                to="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-bold uppercase tracking-wider text-neutral-700 py-1"
              >
                Wishlist ({wishlist.length})
              </Link>
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 bg-black text-white font-bold text-xs uppercase rounded transition-colors"
                >
                  Sign In / Register
                </Link>
              ) : (
                <Link
                  to="/account/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xs font-bold uppercase tracking-wider text-neutral-700 py-1"
                >
                  My Orders & Profile
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
