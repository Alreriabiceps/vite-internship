import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ConditionalDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to role-based dashboard paths
  switch (user.role) {
    case "student":
      return <Navigate to="/student/dashboard" replace />;
    case "company":
      return <Navigate to="/company/dashboard" replace />;
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};

export default ConditionalDashboard;
