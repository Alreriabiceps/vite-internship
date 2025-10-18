import { useAuth } from "../contexts/AuthContext";
import { StudentProfile } from "./user/student";
import { CompanyProfile } from "./user/company";
import { AdminProfile } from "./user/admin";

const ConditionalProfile = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case "company":
      return <CompanyProfile />;
    case "admin":
      return <AdminProfile />;
    case "student":
    default:
      return <StudentProfile />;
  }
};

export default ConditionalProfile;
