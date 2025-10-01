import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import StudentSidebar from "./sidebars/StudentSidebar";
import AdminSidebar from "./sidebars/AdminSidebar";
import CompanySidebar from "./sidebars/CompanySidebar";
import StudentHeader from "./headers/StudentHeader";
import AdminHeader from "./headers/AdminHeader";
import CompanyHeader from "./headers/CompanyHeader";
import Footer from "./Footer";
import { Menu, X } from "lucide-react";

const Layout = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getSidebar = () => {
    const props = {
      onCloseMobile: () => setSidebarOpen(false),
      sidebarOpen,
    };

    switch (user?.role) {
      case "student":
        return <StudentSidebar {...props} />;
      case "admin":
        return <AdminSidebar {...props} />;
      case "company":
        return <CompanySidebar {...props} />;
      default:
        return <StudentSidebar {...props} />;
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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

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
