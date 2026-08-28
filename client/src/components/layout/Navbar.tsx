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
  Sparkles,
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
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const totalCartCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  const handleLogout = () => {
    dispatch(logoutUser());
    setIsUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Jerseys', path: '/shop?type=Home,Away,Third+Kit' },
    { label: 'World Cup Specials', path: '/shop?league=International', special: true },
    { label: 'Premium Quality', path: '/shop?type=Player+Version' },
    { label: 'About Us', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-neutral-200/80 transition-all font-sans w-full">
      <div className="w-full px-5 sm:px-8 md:px-14 lg:px-16 xl:px-20">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo: JERSEY WORLD */}
          <Link to="/" className="flex items-center gap-1.5 group relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center"
            >
              <span className="text-3xl sm:text-4xl font-normal text-[#171C1B] font-display tracking-tight uppercase">
                JERSEY WORLD<span className="text-[#FF5722] inline-block animate-pulse">.</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation Links with Framer Hover Highlight */}
          <nav
            onMouseLeave={() => setHoveredNav(null)}
            className="hidden md:flex items-center space-x-1 lg:space-x-2 relative"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path.split('?')[0] && (link.path === '/' ? location.pathname === '/' : true);
              const isHovered = hoveredNav === link.label;

              return (
                <Link
                  key={link.label}
                  to={link.path}
                  onMouseEnter={() => setHoveredNav(link.label)}
                  className="relative px-3.5 py-2 text-xs sm:text-sm font-semibold tracking-wider uppercase transition-colors font-sans text-[#171C1B] hover:text-[#FF5722] flex items-center gap-1.5"
                >
                  {isHovered && (
                    <motion.div
                      layoutId="navbar-hover-pill"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="absolute inset-0 bg-neutral-100 rounded-full -z-10"
                    />
                  )}
                  {link.special && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722] animate-ping" />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(setSearchModalOpen(true))}
              className="p-2 rounded-full hover:bg-neutral-100 text-black hover:text-[#FF5722] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </motion.button>

            {/* Wishlist Link */}
            {!isAdmin && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/account/wishlist"
                  className="relative p-2 rounded-full hover:bg-neutral-100 text-black hover:text-[#FF5722] transition-colors block"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5 stroke-[2]" />
                  <AnimatePresence>
                    {wishlist.length > 0 && (
                      <motion.span
                        key="wishlist-badge"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute top-0 right-0 w-4 h-4 bg-[#FF5722] text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center shadow"
                      >
                        {wishlist.length}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            )}

            {/* Shopping Bag Button with Animated Badge */}
            {!isAdmin && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => dispatch(toggleCartDrawer())}
                className="relative p-2 rounded-full hover:bg-neutral-100 text-black hover:text-[#FF5722] transition-colors flex items-center gap-1.5"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5 stroke-[2]" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={totalCartCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="text-xs font-mono font-bold text-black"
                  >
                    {totalCartCount}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            )}

            {/* Admin Direct Portal Shortcut */}
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white text-xs font-bold uppercase rounded-full hover:bg-[#FF5722] transition-all shadow-sm"
              >
                <Shield className="w-3.5 h-3.5 text-[#FF5722]" /> Admin
              </Link>
            )}

            {/* Auth / Account Profile Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-black/10 transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-gray-100 bg-neutral-50/50">
                          <p className="text-xs font-bold text-black truncate">{user?.name}</p>
                          <p className="text-[10px] text-gray-500 font-mono truncate">{user?.email}</p>
                          <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black text-white font-mono">
                            {user?.role}
                          </span>
                        </div>

                        {isAdmin ? (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-black hover:bg-neutral-100 font-bold transition-colors"
                          >
                            <Shield className="w-4 h-4 text-[#FF5722]" /> Admin Dashboard
                          </Link>
                        ) : (
                          <>
                            <Link
                              to="/account/orders"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-neutral-100 font-medium transition-colors"
                            >
                              <Package className="w-4 h-4 text-neutral-500" /> My Orders & Tracking
                            </Link>
                            <Link
                              to="/account/wishlist"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-neutral-100 font-medium transition-colors"
                            >
                              <Heart className="w-4 h-4 text-[#FF5722]" /> My Wishlist
                            </Link>
                          </>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left border-t border-gray-100 mt-1 transition-colors"
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
                  className="hidden sm:inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase text-black hover:text-white hover:bg-black border border-black rounded-full tracking-wider transition-all duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-black hover:bg-neutral-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white/95 backdrop-blur-xl border-b border-gray-200 px-6 py-6 space-y-4 shadow-xl font-sans overflow-hidden"
          >
            {navLinks.map((link, idx) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
              >
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-base font-semibold uppercase tracking-wider ${
                    link.special ? 'text-[#FF5722]' : 'text-black hover:text-[#FF5722]'
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            {!isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="pt-2"
              >
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-3 bg-black text-white font-bold text-xs uppercase rounded-full hover:bg-[#FF5722] transition-colors shadow-md"
                >
                  Sign In
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
