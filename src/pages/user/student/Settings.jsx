import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const StudentSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPasswordEmail, setShowCurrentPasswordEmail] =
    useState(false);

  // Forms
  const emailForm = useForm({
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleEmailChange = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to change email";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      toast.success(result.message);

      // Reset form
      emailForm.reset();

      // Show success message about re-login
      toast.success("Please log in again with your new email address", {
        duration: 5000,
      });
    } catch (error) {
      console.error("Error changing email:", error);
      toast.error(error.message || "Failed to change email");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to change password";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      toast.success(result.message);

      // Reset form
      passwordForm.reset();
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    {
      id: "email",
      label: "Change Email",
      icon: Mail,
    },
    {
      id: "password",
      label: "Change Password",
      icon: Lock,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account security settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Current Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Student Account
            </CardTitle>
            <CardDescription>
              Your student account information and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profilePicUrl} alt={user?.firstName} />
                <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-semibold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <Badge className="bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Student
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Verified</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Student ID
                </Label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                  {user?.studentId || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Program
                </Label>
                <p className="text-sm">{user?.program || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Year Level
                </Label>
                <p className="text-sm">{user?.yearLevel || "N/A"}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </Label>
                <p className="text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Change Email Address</CardTitle>
                <CardDescription>
                  Update your student email address. You will need to re-login
                  with the new email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Important Notice</p>
                      <p>
                        Changing your email will require you to log in again
                        with the new email address.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={emailForm.handleSubmit(handleEmailChange)}>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="newEmail">New Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newEmail"
                          type="email"
                          className="pl-10"
                          placeholder="Enter new email address"
                          {...emailForm.register("newEmail", {
                            required: "New email is required",
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: "Invalid email address",
                            },
                          })}
                        />
                      </div>
                      {emailForm.formState.errors.newEmail && (
                        <p className="text-sm text-red-500">
                          {emailForm.formState.errors.newEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentPasswordEmail">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPasswordEmail"
                          type={showCurrentPasswordEmail ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Enter current password"
                          {...emailForm.register("currentPassword", {
                            required: "Current password is required",
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() =>
                            setShowCurrentPasswordEmail(
                              !showCurrentPasswordEmail
                            )
                          }
                        >
                          {showCurrentPasswordEmail ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {emailForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500">
                          {emailForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Changing Email..." : "Change Email"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your student account password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Password Security</p>
                      <p>
                        Choose a strong password with at least 8 characters,
                        including uppercase, lowercase, numbers, and special
                        characters.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={passwordForm.handleSubmit(handlePasswordChange)}
                >
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Enter current password"
                          {...passwordForm.register("currentPassword", {
                            required: "Current password is required",
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-sm text-red-500">
                          {
                            passwordForm.formState.errors.currentPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Enter new password"
                          {...passwordForm.register("newPassword", {
                            required: "New password is required",
                            minLength: {
                              value: 8,
                              message: "Password must be at least 8 characters",
                            },
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-sm text-red-500">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          placeholder="Confirm new password"
                          {...passwordForm.register("confirmPassword", {
                            required: "Please confirm your new password",
                            validate: (value) =>
                              value === passwordForm.getValues("newPassword") ||
                              "Passwords do not match",
                          })}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-gray-600"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? <EyeOff /> : <Eye />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-500">
                          {
                            passwordForm.formState.errors.confirmPassword
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Changing Password..." : "Change Password"}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentSettings;
