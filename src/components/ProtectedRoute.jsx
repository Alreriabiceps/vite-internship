import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRoles = null,
  requiredRole = null,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoute check:", {
    path: location.pathname,
    isAuthenticated,
    isLoading,
    userRole: user?.role,
    allowedRoles,
    requiredRole,
  });

  if (isLoading) {
    console.log("⏳ Auth is loading...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    // Redirect to appropriate login page based on current path
    if (location.pathname.startsWith("/company")) {
      return <Navigate to="/clogin" state={{ from: location }} replace />;
    } else if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/alogin" state={{ from: location }} replace />;
    }
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role-based access
  const roles = allowedRoles || (requiredRole ? [requiredRole] : null);

  if (roles && !roles.includes(user?.role)) {
    console.log(
      "❌ Role mismatch! User role:",
      user?.role,
      "Allowed roles:",
      roles
    );
    console.log("🔄 Redirecting to correct dashboard");
    // Redirect to user's correct dashboard based on their role
    switch (user?.role) {
      case "student":
        return <Navigate to="/student/dashboard" replace />;
      case "company":
        return <Navigate to="/company/dashboard" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  console.log("✅ Access granted!");
  return children;
};

export default ProtectedRoute;
