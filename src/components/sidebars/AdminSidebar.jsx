import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  BarChart3,
  Bell,
  Settings,
  Users,
  X,
  FileText,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { cn } from "../../lib/utils";

const AdminSidebar = ({ sidebarOpen, onCloseMobile }) => {
  const navigationItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "All Interns", href: "/admin/interns", icon: Users },
    { name: "All Companies", href: "/admin/companies", icon: Building2 },
    {
      name: "Internship Postings",
      href: "/admin/internship-postings",
      icon: Briefcase,
    },
    {
      name: "Whitelisted Students",
      href: "/admin/preferred-applicants",
      icon: UserCheck,
    },
    { name: "Reports & Analytics", href: "/admin/reports", icon: FileText },
  ];

  return (
    <div
      className={cn(
        "w-64 border-r border-gray-200 bg-white shadow-sm",
        "fixed md:static inset-y-0 left-0",
        "transform transition-transform duration-300 ease-in-out z-50",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Close button (mobile only) */}
      <button
        onClick={onCloseMobile}
        className="md:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Close menu"
      >
        <X className="h-5 w-5 text-gray-600" />
      </button>

      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
            <Settings className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-gray-900">Admin Portal</span>
        </div>
      </div>

      <nav className="space-y-1 px-3 pb-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
