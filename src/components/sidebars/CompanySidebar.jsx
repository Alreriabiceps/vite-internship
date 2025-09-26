import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  MessageSquare,
  Building2,
} from "lucide-react";
import { cn } from "../../lib/utils";

const CompanySidebar = () => {
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Profile", href: "/profile", icon: Building2 },
    { name: "My Internships", href: "/my-internships", icon: Briefcase },
    { name: "Browse Interns", href: "/browse-interns", icon: GraduationCap },
    { name: "Messages", href: "/messages", icon: MessageSquare },
  ];

  return (
    <div className="w-64 border-r border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Company Portal
          </span>
        </div>
      </div>

      <nav className="space-y-1 px-3">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
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

export default CompanySidebar;
