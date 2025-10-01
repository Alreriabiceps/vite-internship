import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  GraduationCap,
  Building2,
  Briefcase,
  Bell,
  MessagesSquare,
  Heart,
} from "lucide-react";
import { cn } from "../../lib/utils";

const StudentSidebar = () => {
  const navigationItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/student/profile", icon: User },
    {
      name: "Browse Internships",
      href: "/student/browse-internships",
      icon: Briefcase,
    },
    {
      name: "Interested Companies",
      href: "/student/interested-companies",
      icon: Heart,
    },
  ];

  return (
    <div className="w-64 border-r border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Student Portal
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

export default StudentSidebar;
