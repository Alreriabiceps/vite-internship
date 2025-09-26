import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { api } from "../lib/api";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  User,
  Award,
  CheckCircle,
  Star,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Code,
  Users,
  Building2,
} from "lucide-react";

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSkills, setFilterSkills] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Mock students data
      const mockStudents = [
        {
          _id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@student.com",
          program: "Computer Science",
          yearLevel: "3rd Year",
          studentId: "CS2024001",
          skills: [
            { name: "JavaScript", level: "Intermediate" },
            { name: "React", level: "Intermediate" },
            { name: "Node.js", level: "Beginner" },
          ],
          softSkills: ["Communication", "Teamwork"],
          certifications: ["AWS Certified", "Google Analytics"],
          readinessChecklist: [
            { requirement: "Resume Updated", completed: true },
            { requirement: "Portfolio Ready", completed: true },
            { requirement: "LinkedIn Optimized", completed: true },
            { requirement: "Skills Assessed", completed: true },
            { requirement: "Goals Defined", completed: true },
          ],
          endorsements: 5,
          badges: ["Top Performer", "Team Player"],
        },
        {
          _id: "2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@student.com",
          program: "Information Technology",
          yearLevel: "4th Year",
          studentId: "IT2024002",
          skills: [
            { name: "Python", level: "Advanced" },
            { name: "Django", level: "Intermediate" },
            { name: "SQL", level: "Intermediate" },
          ],
          softSkills: ["Leadership", "Problem Solving"],
          certifications: ["Microsoft Azure", "Oracle Database"],
          readinessChecklist: [
            { requirement: "Resume Updated", completed: true },
            { requirement: "Portfolio Ready", completed: false },
            { requirement: "LinkedIn Optimized", completed: true },
            { requirement: "Skills Assessed", completed: true },
            { requirement: "Goals Defined", completed: true },
          ],
          endorsements: 8,
          badges: ["Leadership", "Innovation"],
        },
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchTerm ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.studentProfile?.program
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.studentProfile?.skills?.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesProgram =
      !filterProgram ||
      filterProgram === "all" ||
      student.studentProfile?.program === filterProgram;
    const matchesYear =
      !filterYear ||
      filterYear === "all" ||
      student.studentProfile?.yearLevel === filterYear;
    const matchesSkills =
      !filterSkills ||
      student.studentProfile?.skills?.some((skill) =>
        skill.toLowerCase().includes(filterSkills.toLowerCase())
      );

    return matchesSearch && matchesProgram && matchesYear && matchesSkills;
  });

  const getReadinessScore = (checklist) => {
    if (!checklist) return 0;
    const totalItems = Object.keys(checklist).length;
    const completedItems = Object.values(checklist).filter(Boolean).length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const getBadgeColor = (badge) => {
    switch (badge.toLowerCase()) {
      case "excellent":
        return "bg-yellow-100 text-yellow-800";
      case "good":
        return "bg-green-100 text-green-800";
      case "average":
        return "bg-blue-100 text-blue-800";
      case "needs improvement":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEndorsementCount = (endorsements) => {
    return endorsements?.length || 0;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground">Loading student profiles...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">
          Browse and manage student profiles
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
          <CardDescription>
            Find students based on your criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Program</label>
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  <SelectItem value="Computer Science">
                    Computer Science
                  </SelectItem>
                  <SelectItem value="Information Technology">
                    Information Technology
                  </SelectItem>
                  <SelectItem value="Software Engineering">
                    Software Engineering
                  </SelectItem>
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Year Level</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                  <SelectItem value="5th Year">5th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Skills</label>
              <Input
                placeholder="Filter by skills..."
                value={filterSkills}
                onChange={(e) => setFilterSkills(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setFilterProgram("");
                setFilterYear("");
                setFilterSkills("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={student.profilePictureUrl} />
                  <AvatarFallback>
                    {student.firstName?.[0]}
                    {student.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {student.studentProfile?.program} •{" "}
                    {student.studentProfile?.yearLevel}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Student ID */}
              {student.studentProfile?.studentId && (
                <div className="flex items-center space-x-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-medium">
                    {student.studentProfile.studentId}
                  </span>
                </div>
              )}

              {/* Skills */}
              {student.studentProfile?.skills &&
                student.studentProfile.skills.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.studentProfile.skills
                        .slice(0, 3)
                        .map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      {student.studentProfile.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.studentProfile.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

              {/* Readiness Checklist */}
              {student.studentProfile?.readinessChecklist && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Readiness</span>
                    </div>
                    <span className="text-sm font-medium">
                      {getReadinessScore(
                        student.studentProfile.readinessChecklist
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${getReadinessScore(
                          student.studentProfile.readinessChecklist
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Badges */}
              {student.studentProfile?.badges &&
                student.studentProfile.badges.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Badges</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.studentProfile.badges
                        .slice(0, 2)
                        .map((badge, index) => (
                          <Badge
                            key={index}
                            className={`text-xs ${getBadgeColor(badge)}`}
                          >
                            {badge}
                          </Badge>
                        ))}
                      {student.studentProfile.badges.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.studentProfile.badges.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

              {/* Endorsements */}
              {student.studentProfile?.endorsements && (
                <div className="flex items-center space-x-2 text-sm">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Endorsements:</span>
                  <span className="font-medium">
                    {getEndorsementCount(student.studentProfile.endorsements)}
                  </span>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-1 text-sm text-muted-foreground">
                {student.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{student.email}</span>
                  </div>
                )}
                {student.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Profile
                </Button>
                {user?.role === "company" && (
                  <Button size="sm" className="flex-1">
                    Contact
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Students;
