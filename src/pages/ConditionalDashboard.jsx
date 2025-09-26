import { useAuth } from "../contexts/AuthContext";
import Dashboard from "./Dashboard";
import CompanyDashboard from "./CompanyDashboard";

const ConditionalDashboard = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "company":
      return <CompanyDashboard />;
    case "student":
    case "admin":
    default:
      return <Dashboard />;
  }
};

export default ConditionalDashboard;

