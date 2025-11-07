import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { CartProvider } from './hooks/useCart';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import ToastContainer from './components/ui/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import NetworkStatusBanner from './components/NetworkStatusBanner';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactUsPage from './pages/ContactUsPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsAndConditionsPage from './pages/TermsAndConditionsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import BlogPage from './pages/BlogPage';
import CaseStudiesPage from './pages/CaseStudiesPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import AllServicesOverviewPage from './pages/AllServicesOverviewPage';
import ServiceSubPage from './pages/services/ServiceSubPage';
import BrandingPage from './pages/services/BrandingPage';
import WebsitesPage from './pages/services/WebsitesPage';
import WebsitePerformancePage from './pages/WebsitePerformancePage';

// User Dashboard
import UserDashboardPage from './pages/UserDashboardPage';
import AllServicesPage from './pages/AllServicesPage';
import MyServicesPage from './pages/MyServicesPage';
import UserManageServicePage from './pages/UserManageServicePage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import UserProfilePage from './pages/UserProfilePage';
import UserSupportPage from './pages/UserSupportPage';
import UserTicketViewPage from './pages/UserTicketViewPage';
import CheckoutPage from './pages/CheckoutPage';
import ReferAndEarnPage from './pages/ReferAndEarnPage';

// Admin Dashboard
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminManageUserPage from './pages/AdminManageUserPage';
import AdminServicesPage from './pages/AdminServicesPage';
import AdminManageServicePage from './pages/AdminManageServicePage';
import AdminManagePlansPage from './pages/AdminManagePlansPage';
import AdminManageCategoriesPage from './pages/AdminManageCategoriesPage';
import AdminSupportPage from './pages/AdminSupportPage';
import AdminTicketViewPage from './pages/AdminTicketViewPage';
import AdminManageFAQsPage from './pages/AdminManageFAQsPage';
import AdminAnnouncementsPage from './pages/AdminAnnouncementsPage';
import AdminManageChatbotPage from './pages/AdminManageChatbotPage';
import AdminManagePagesPage from './pages/AdminManagePagesPage';
import AdminManageBlogPage from './pages/AdminManageBlogPage';
import AdminConsultationsPage from './pages/AdminConsultationsPage';
import AdminContactMessagesPage from './pages/AdminContactMessagesPage';

// Support Dashboard
import SupportDashboardPage from './pages/SupportDashboardPage';


const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboardPage = location.pathname.startsWith('/user/') ||
                          location.pathname.startsWith('/admin/') ||
                          location.pathname.startsWith('/support/');

  // Global auth error listener
  useEffect(() => {
    const handleAuthError = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    };

    window.addEventListener('auth-error', handleAuthError);

    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, []);
  
  return (
    <>
      {!isDashboardPage && <Header />}
      <main className="font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/case-studies" element={<CaseStudiesPage />} />
          <Route path="/success-stories" element={<SuccessStoriesPage />} />
          <Route path="/services" element={<AllServicesOverviewPage />} />
          <Route path="/services/branding" element={<BrandingPage />} />
          <Route path="/services/websites" element={<WebsitesPage />} />
          <Route path="/services/:serviceName" element={<ServiceSubPage />} />
          <Route path="/website-performance" element={<WebsitePerformancePage />} />


          {/* User Dashboard Routes */}
          <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboardPage /></ProtectedRoute>} />
          <Route path="/user/all-services" element={<ProtectedRoute allowedRoles={['user']}><AllServicesPage /></ProtectedRoute>} />
          <Route path="/user/my-services" element={<ProtectedRoute allowedRoles={['user']}><MyServicesPage /></ProtectedRoute>} />
          <Route path="/user/service/:id" element={<ProtectedRoute allowedRoles={['user']}><UserManageServicePage /></ProtectedRoute>} />
          <Route path="/user/payment-history" element={<ProtectedRoute allowedRoles={['user']}><PaymentHistoryPage /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRoles={['user']}><UserProfilePage /></ProtectedRoute>} />
          <Route path="/user/support" element={<ProtectedRoute allowedRoles={['user']}><UserSupportPage /></ProtectedRoute>} />
          <Route path="/user/support/ticket/:id" element={<ProtectedRoute allowedRoles={['user']}><UserTicketViewPage /></ProtectedRoute>} />
          <Route path="/user/checkout" element={<ProtectedRoute allowedRoles={['user']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="/user/refer-earn" element={<ProtectedRoute allowedRoles={['user']}><ReferAndEarnPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageUserPage /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin']}><AdminServicesPage /></ProtectedRoute>} />
          <Route path="/admin/services/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageServicePage /></ProtectedRoute>} />
          <Route path="/admin/manage-plans" element={<ProtectedRoute allowedRoles={['admin']}><AdminManagePlansPage /></ProtectedRoute>} />
          <Route path="/admin/manage-categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageCategoriesPage /></ProtectedRoute>} />
          <Route path="/admin/support" element={<ProtectedRoute allowedRoles={['admin', 'support']}><AdminSupportPage /></ProtectedRoute>} />
          <Route path="/admin/support/ticket/:id" element={<ProtectedRoute allowedRoles={['admin', 'support']}><AdminTicketViewPage /></ProtectedRoute>} />
          <Route path="/admin/manage-faqs" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageFAQsPage /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnnouncementsPage /></ProtectedRoute>} />
          <Route path="/admin/manage-chatbot" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageChatbotPage /></ProtectedRoute>} />
          <Route path="/admin/manage-pages" element={<ProtectedRoute allowedRoles={['admin']}><AdminManagePagesPage /></ProtectedRoute>} />
          <Route path="/admin/manage-blog" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageBlogPage /></ProtectedRoute>} />
          <Route path="/admin/consultations" element={<ProtectedRoute allowedRoles={['admin']}><AdminConsultationsPage /></ProtectedRoute>} />
          <Route path="/admin/contact-messages" element={<ProtectedRoute allowedRoles={['admin']}><AdminContactMessagesPage /></ProtectedRoute>} />
          
          {/* Support Routes */}
          <Route path="/support/dashboard" element={<ProtectedRoute allowedRoles={['support']}><SupportDashboardPage /></ProtectedRoute>} />

        </Routes>
      </main>
      {!isDashboardPage && <Footer />}
      <ChatWidget />
    </>
  );
};

const AppWrapper: React.FC = () => (
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
          <ToastContainer />
          <NetworkStatusBanner />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
);


export default AppWrapper;