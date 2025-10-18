import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
// Student Pages
import {
  StudentLogin as Login,
  StudentRegister as Register,
  StudentDashboard as Dashboard,
  StudentProfile as Profile,
  StudentSettings as Settings,
  FindInternships,
  ExploreCompanies,
  MyMatches,
  BrowseInterns as StudentBrowseInterns,
  CompanyProfile,
} from "./pages/user/student";

// Company Pages
import {
  CompanyLogin,
  CompanyRegister,
  CompanyDashboard,
  BrowseInterns,
  CompanyChat,
  PostInternship,
  Internships,
} from "./pages/user/company";

// Admin Pages
import {
  AdminLogin,
  AdminDashboard,
  AdminProfile,
  AdminSystemSettings,
  AdminInterns,
  AdminCompanies,
  AdminCompanyView,
} from "./pages/user/admin";
import Reports from "./pages/user/admin/Reports";
import AdminInternshipPostings from "./pages/user/admin/AdminInternshipPostings";
import AdminPreferredApplicants from "./pages/user/admin/AdminPreferredApplicants";

// Shared Pages
import ConditionalDashboard from "./pages/ConditionalDashboard";
import ConditionalProfile from "./pages/ConditionalProfile";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/alogin" element={<AdminLogin />} />
                <Route path="/clogin" element={<CompanyLogin />} />
                <Route path="/cregister" element={<CompanyRegister />} />

                {/* Legacy routes - redirect to role-based paths */}
                <Route path="/dashboard" element={<ConditionalDashboard />} />
                <Route path="/profile" element={<ConditionalProfile />} />

                {/* STUDENT ROUTES */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                </Route>

                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Profile />} />
                </Route>

                <Route
                  path="/student/settings"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Settings />} />
                </Route>

                <Route
                  path="/student/find-internships"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<FindInternships />} />
                </Route>

                <Route
                  path="/student/explore-companies"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ExploreCompanies />} />
                </Route>

                <Route
                  path="/student/my-matches"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<MyMatches />} />
                </Route>

                <Route
                  path="/student/browse-interns"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<StudentBrowseInterns />} />
                </Route>

                <Route
                  path="/student/company/:companyId"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CompanyProfile />} />
                </Route>

                {/* COMPANY ROUTES */}
                <Route
                  path="/company/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CompanyDashboard />} />
                </Route>

                <Route
                  path="/company/profile"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ConditionalProfile />} />
                </Route>

                <Route
                  path="/company/browse-interns"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<BrowseInterns />} />
                </Route>

                <Route
                  path="/company/chat"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CompanyChat />} />
                </Route>

                <Route
                  path="/company/post-internship"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<PostInternship />} />
                </Route>

                <Route
                  path="/company/internships"
                  element={
                    <ProtectedRoute allowedRoles={["company"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Internships />} />
                </Route>

                {/* ADMIN ROUTES */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                </Route>

                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminProfile />} />
                </Route>

                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminSystemSettings />} />
                </Route>

                <Route
                  path="/admin/interns"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminInterns />} />
                </Route>

                <Route
                  path="/admin/companies"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminCompanies />} />
                  <Route path=":companyId" element={<AdminCompanyView />} />
                </Route>

                <Route
                  path="/admin/internship-postings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminInternshipPostings />} />
                </Route>

                <Route
                  path="/admin/preferred-applicants"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminPreferredApplicants />} />
                </Route>

                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Reports />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "hsl(var(--card))",
                    color: "hsl(var(--card-foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
