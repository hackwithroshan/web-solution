import React, { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import RegistrationPage from './pages/RegistrationPage';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/ui/ToastContainer';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AllServicesPage from './pages/AllServicesPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminManagePlansPage from './pages/AdminManagePlansPage';
import AdminManageCategoriesPage from './pages/AdminManageCategoriesPage';
import AdminManageServicePage from './pages/AdminManageServicePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminManageUserPage from './pages/AdminManageUserPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import UserProfilePage from './pages/UserProfilePage';
import UserSupportPage from './pages/UserSupportPage';
import UserTicketViewPage from './pages/UserTicketViewPage';
import AdminSupportPage from './pages/AdminSupportPage';
import AdminTicketViewPage from './pages/AdminTicketViewPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ChatWidget from './components/ChatWidget';
import AdminManageFAQsPage from './pages/AdminManageFAQsPage';
import AdminAnnouncementsPage from './pages/AdminAnnouncementsPage';
import { CartProvider } from './hooks/useCart';
import CheckoutPage from './pages/CheckoutPage';
import ReferAndEarnPage from './pages/ReferAndEarnPage';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import AdminManageChatbotPage from './pages/AdminManageChatbotPage';
import WebsitePerformancePage from './pages/WebsitePerformancePage';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDashboardRoute = location.pathname.startsWith('/user/') || location.pathname.startsWith('/admin/');
  
  // Add a global listener for authorization errors from the API service
  useEffect(() => {
    const handleAuthError = () => {
        // The API service detected a 401/403 error.
        // We call logout to clear the auth state, which will trigger
        // the ProtectedRoute to redirect to the login page.
        logout();
    };

    window.addEventListener('auth-error', handleAuthError);

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('auth-error', handleAuthError);
    };
  }, [logout]); // Rerun if logout function instance changes


  return (
    <div className={`min-h-screen flex flex-col ${isDashboardRoute ? 'bg-gray-100 text-gray-800' : ''}`}>
      <ToastContainer />
      {!isDashboardRoute && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/website-analyzer" element={<WebsitePerformancePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route 
            path="/user/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserDashboardPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/user/all-services" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <AllServicesPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/user/checkout" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/payment-history" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <PaymentHistoryPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/user/profile" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserProfilePage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/user/support" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserSupportPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/user/support/:id" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserTicketViewPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/refer-earn" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <ReferAndEarnPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/services" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminServicesPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/services/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManageServicePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/users/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManageUserPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/manage-plans" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManagePlansPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/manage-categories" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManageCategoriesPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/manage-faqs" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManageFAQsPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/announcements" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAnnouncementsPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/manage-chatbot" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminManageChatbotPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/support" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSupportPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/admin/support/:id" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTicketViewPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer />}
      {user && <ChatWidget />}
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <HashRouter>
            <NetworkStatusBanner />
            {/* FIX: The error "Property 'children' is missing" was a cascading error from the broken ErrorBoundary component. Fixing ErrorBoundary resolves this issue without any changes to this file's code. */}
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </HashRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;