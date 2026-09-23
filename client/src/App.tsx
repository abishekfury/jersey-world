import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAppDispatch } from './store';
import { fetchCurrentUser } from './store/authSlice';
import { fetchCart } from './store/cartSlice';

// Layouts & Modals
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { CartDrawer } from './components/cart/CartDrawer';
import { SearchBarModal } from './components/product/SearchBarModal';
import { SizeGuideModal } from './components/ui/SizeGuideModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { ScrollProgress } from './components/ui/ScrollProgress';
import { BackToTop } from './components/ui/BackToTop';
import { LiveSalesProof } from './components/ui/LiveSalesProof';

// Public & Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderFailurePage } from './pages/OrderFailurePage';
import { OrdersPage } from './pages/account/OrdersPage';
import { WishlistPage } from './pages/account/WishlistPage';
import { AddressesPage } from './pages/account/AddressesPage';
import { ProfilePage } from './pages/account/ProfilePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { GoogleCallbackPage } from './pages/auth/GoogleCallbackPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { ShippingPolicyPage } from './pages/ShippingPolicyPage';
import { ReturnPolicyPage } from './pages/ReturnPolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';


export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchCurrentUser());
    dispatch(fetchCart());
  }, [dispatch]);

  // Scroll to top on route change or navigation action
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.key]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-white text-black font-sans selection:bg-[#FF5722] selection:text-white">
      {!isAdminRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public Store Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:identifier" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/order-failure" element={<OrderFailurePage />} />
          <Route path="/order-failure/:orderId" element={<OrderFailurePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/terms-and-conditions" element={<TermsPage />} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/return-policy" element={<ReturnPolicyPage />} />
          <Route path="/return-and-refund-policy" element={<ReturnPolicyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />


          {/* Customer Portal Nested Routes */}
          <Route path="/account" element={<CustomerLayout />}>
            <Route index element={<OrdersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Admin Dashboard Protected Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="coupons" element={<AdminCouponsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>


          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <SearchBarModal />
      <SizeGuideModal />
      <ToastContainer />
      {!isAdminRoute && (
        <>
          <ScrollProgress />
          <LiveSalesProof />
          <BackToTop />
        </>
      )}
    </div>
  );
};
