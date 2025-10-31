import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/ui/ToastContainer';
import ChatWidget from './components/ChatWidget';
import { CartProvider } from './hooks/useCart';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusBanner from './components/NetworkStatusBanner';

// Page Loader for Suspense Fallback
const PageLoader: React.FC = () => (
  <div className="flex justify-center items-center h-screen w-full bg-[#1E1E2C]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

// Lazy-load all page components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ContactUsPage = lazy(() => import('./pages/ContactUsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const UserDashboardPage = lazy(() => import('./pages/UserDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const SupportDashboardPage = lazy(() => import('./pages/SupportDashboardPage')); // New Support Dashboard
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AllServicesPage = lazy(() => import('./pages/AllServicesPage'));
const AdminServicesPage = lazy(() => import('./pages/AdminServicesPage'));
const AdminManagePlansPage = lazy(() => import('./pages/AdminManagePlansPage'));
const AdminManageCategoriesPage = lazy(() => import('./pages/AdminManageCategoriesPage'));
const AdminManageServicePage = lazy(() => import('./pages/AdminManageServicePage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminManageUserPage = lazy(() => import('./pages/AdminManageUserPage'));
const PaymentHistoryPage = lazy(() => import('./pages/PaymentHistoryPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const UserSupportPage = lazy(() => import('./pages/UserSupportPage'));
const UserTicketViewPage = lazy(() => import('./pages/UserTicketViewPage'));
const AdminSupportPage = lazy(() => import('./pages/AdminSupportPage'));
const AdminTicketViewPage = lazy(() => import('./pages/AdminTicketViewPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminManageFAQsPage = lazy(() => import('./pages/AdminManageFAQsPage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/AdminAnnouncementsPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ReferAndEarnPage = lazy(() => import('./pages/ReferAndEarnPage'));
const AdminManageChatbotPage = lazy(() => import('./pages/AdminManageChatbotPage'));
const WebsitePerformancePage = lazy(() => import('./pages/WebsitePerformancePage'));
const AdminManagePagesPage = lazy(() => import('./pages/AdminManagePagesPage'));
const AdminManageBlogPage = lazy(() => import('./pages/AdminManageBlogPage'));
const UserManageServicePage = lazy(() => import('./pages/UserManageServicePage'));
const MyServicesPage = lazy(() => import('./pages/MyServicesPage'));


const AppContent: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDashboardRoute = location.pathname.startsWith('/user/') || location.pathname.startsWith('/admin/') || location.pathname.startsWith('/support/');
  
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
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
              path="/user/service/:id" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserManageServicePage />
                </ProtectedRoute>
              } 
            />
             <Route 
              path="/user/my-services" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <MyServicesPage />
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
              path="/admin/manage-pages" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminManagePagesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/manage-blog" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminManageBlogPage />
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
                <ProtectedRoute allowedRoles={['admin', 'support']}>
                  <AdminSupportPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/support/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'support']}>
                  <AdminTicketViewPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/support/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'support']}>
                  <SupportDashboardPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
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
          <BrowserRouter>
            <NetworkStatusBanner />
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;