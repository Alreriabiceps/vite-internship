import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import StudentSidebar from "./sidebars/StudentSidebar";
import AdminSidebar from "./sidebars/AdminSidebar";
import CompanySidebar from "./sidebars/CompanySidebar";
import StudentHeader from "./headers/StudentHeader";
import AdminHeader from "./headers/AdminHeader";
import CompanyHeader from "./headers/CompanyHeader";
import Footer from "./Footer";

const Layout = () => {
  const { user } = useAuth();

  const getSidebar = () => {
    switch (user?.role) {
      case "student":
        return <StudentSidebar />;
      case "admin":
        return <AdminSidebar />;
      case "company":
        return <CompanySidebar />;
      default:
        return <StudentSidebar />;
    }
  };

  const getHeader = () => {
    switch (user?.role) {
      case "student":
        return <StudentHeader />;
      case "admin":
        return <AdminHeader />;
      case "company":
        return <CompanyHeader />;
      default:
        return <StudentHeader />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        {getSidebar()}
        <div className="flex-1 flex flex-col bg-white">
          {getHeader()}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
