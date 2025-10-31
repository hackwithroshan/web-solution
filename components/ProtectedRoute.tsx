import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  const location = useLocation();

  // 1. Check for authentication token. If missing, redirect to the login page.
  //    We also pass the original location so the user can be redirected back after login.
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check for a valid user object. This is a safety check in case the token is present
  //    but the user data is missing (e.g., localStorage corruption).
  if (!user) {
    // If user is missing, treat as unauthenticated.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check for authorization. If the user's role is not in the list of allowed roles,
  //    redirect them to their respective dashboard, providing a better user experience
  //    than redirecting to the public home page.
  if (!allowedRoles.includes(user.role)) {
    let dashboardPath = '/user/dashboard';
    if (user.role === 'admin') {
        dashboardPath = '/admin/dashboard';
    } else if (user.role === 'support') {
        dashboardPath = '/support/dashboard';
    }
    return <Navigate to={dashboardPath} replace />;
  }
  
  // 4. If all checks pass, render the requested component.
  return <>{children}</>;
};

export default ProtectedRoute;