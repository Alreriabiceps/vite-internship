import { useAuth } from "../contexts/AuthContext";
import { StudentProfile } from "./user/student";
import { CompanyProfile } from "./user/company";

const ConditionalProfile = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "company":
      return <CompanyProfile />;
    case "student":
    case "admin":
    default:
      return <StudentProfile />;
  }
};

export default ConditionalProfile;
