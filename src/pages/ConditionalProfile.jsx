import { useAuth } from "../contexts/AuthContext";
import Profile from "./Profile";
import CompanyProfile from "./CompanyProfile";

const ConditionalProfile = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "company":
      return <CompanyProfile />;
    case "student":
    case "admin":
    default:
      return <Profile />;
  }
};

export default ConditionalProfile;

