import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Hash,
} from "lucide-react";
import { authAPI } from "../../../lib/api";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const role = watch("role");

  const password = watch("password");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.register({
        ...data,
        role: "student",
      });

      if (response.data.success) {
        toast.success("Student account created successfully!");
        navigate("/");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-4xl bg-white shadow-xl border border-gray-200 rounded-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <GraduationCap className="h-8 w-8 text-gray-700" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Student Registration
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create your student account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Name fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className="pl-10"
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className="pl-10"
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="studentId" className="text-sm font-medium">
                  Student ID
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="studentId"
                    placeholder="CS2024001"
                    className="pl-10"
                    {...register("studentId", {
                      required: "Student ID is required",
                    })}
                  />
                </div>
                {errors.studentId && (
                  <p className="text-sm text-destructive">
                    {errors.studentId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: Contact fields */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-10"
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
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09666751586 or +639666751586"
                    className="pl-10"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^(\+639\d{9}|09\d{9})$/,
                        message:
                          "Phone number must be 11 digits starting with 09 or +639",
                      },
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="yearLevel" className="text-sm font-medium">
                  Year Level
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Select
                    onValueChange={(value) => setValue("yearLevel", value)}
                    {...register("yearLevel", {
                      required: "Year level is required",
                    })}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="5th Year">5th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.yearLevel && (
                  <p className="text-sm text-destructive">
                    {errors.yearLevel.message}
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Program selection */}
            <div className="space-y-2">
              <label htmlFor="program" className="text-sm font-medium">
                Program/Course
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Select
                  onValueChange={(value) => setValue("program", value)}
                  {...register("program", {
                    required: "Program is required",
                  })}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bachelor of Science in Marine Transportation">
                      Bachelor of Science in Marine Transportation
                    </SelectItem>
                    <SelectItem value="Bachelor of Science in Marine Engineering">
                      Bachelor of Science in Marine Engineering
                    </SelectItem>
                    <SelectItem value="Bachelor of Science in Nursing">
                      Bachelor of Science in Nursing
                    </SelectItem>
                    <SelectItem value="Bachelor of Early Childhood Education">
                      Bachelor of Early Childhood Education
                    </SelectItem>
                    <SelectItem value="Bachelor of Technical-Vocational Teacher Education (Major in Food and Service Management)">
                      Bachelor of Technical-Vocational Teacher Education (Major
                      in Food and Service Management)
                    </SelectItem>
                    <SelectItem value="Bachelor of Science in Entrepreneurship">
                      Bachelor of Science in Entrepreneurship
                    </SelectItem>
                    <SelectItem value="Bachelor of Science in Management Accounting">
                      Bachelor of Science in Management Accounting
                    </SelectItem>
                    <SelectItem value="Bachelor of Science in Information System">
                      Bachelor of Science in Information System
                    </SelectItem>
                    <SelectItem value="Bachelor of Science in Tourism Management">
                      Bachelor of Science in Tourism Management
                    </SelectItem>
                    <SelectItem value="Bachelor of Science in Criminology">
                      Bachelor of Science in Criminology
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {errors.program && (
                <p className="text-sm text-destructive">
                  {errors.program.message}
                </p>
              )}
            </div>

            {/* Row 4: Password fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10"
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
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Student Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Already have a student account?</p>
            <Link to="/" className="text-gray-900 hover:underline font-medium">
              Sign In
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p className="mb-2">Need access to other portals?</p>
            <div className="space-x-4">
              <Link to="/clogin" className="text-gray-700 hover:underline">
                Company Login
              </Link>
              <Link to="/alogin" className="text-gray-700 hover:underline">
                Admin Login
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
