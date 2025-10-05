import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  GraduationCap,
  AlertCircle,
  Info,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/student/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoginError(""); // Clear previous errors
    setShowEmailWarning(false);

    const result = await login(data);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      // Set specific error messages based on common issues
      if (data.email && !data.email.includes("@")) {
        setLoginError("Please enter a valid email address");
      } else {
        setLoginError(
          "Invalid email or password. Please check your credentials."
        );
        setShowEmailWarning(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-gray-700" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Student Portal
          </CardTitle>
          <CardDescription className="text-gray-600">
            Access your student dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Login Error Display */}
          {loginError && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-700" />
                <p className="text-sm text-gray-800 font-medium">
                  {loginError}
                </p>
              </div>
            </div>
          )}

          {/* Email Warning */}
          {showEmailWarning && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-gray-600 mt-0.5" />
                <div className="text-sm text-gray-800">
                  <p className="font-medium mb-1">Having trouble logging in?</p>
                  <p className="text-xs">
                    If you recently updated your email in your profile, you'll
                    need to use your new email address to log in.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Student Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter student email"
                  className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter student password"
                  className="pl-10 pr-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Access Student Portal"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Don't have a student account?</p>
            <Link
              to="/register"
              className="text-gray-900 hover:underline font-medium"
            >
              Register as Student
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
