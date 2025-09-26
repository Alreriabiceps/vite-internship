import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  GraduationCap,
  Search,
  Filter,
  MapPin,
  Calendar,
  Code,
  Star,
  Award,
  MessageSquare,
  Eye,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

const BrowseInterns = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API calls later
      const mockStudents = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@student.edu",
          program: "Bachelor of Science in Information System",
          yearLevel: "3rd Year",
          location: "Manila, Philippines",
          profilePicUrl: null,
          skills: ["React", "JavaScript", "Node.js", "MongoDB", "Python"],
          softSkills: ["Leadership", "Communication", "Problem Solving"],
          badges: [
            { name: "React Expert", imageUrl: null },
            { name: "JavaScript Master", imageUrl: null },
          ],
          certificates: [
            { name: "AWS Cloud Practitioner", imageUrl: null },
            { name: "Google Analytics Certified", imageUrl: null },
          ],
          gpa: 3.8,
          availability: "Available",
          preferredDuration: "3 months",
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@student.edu",
          program: "Bachelor of Science in Business Administration",
          yearLevel: "4th Year",
          location: "Quezon City, Philippines",
          profilePicUrl: null,
          skills: [
            "Marketing",
            "Social Media",
            "Content Creation",
            "Analytics",
          ],
          softSkills: ["Creativity", "Teamwork", "Time Management"],
          badges: [
            { name: "Marketing Pro", imageUrl: null },
            { name: "Content Creator", imageUrl: null },
          ],
          certificates: [
            { name: "HubSpot Marketing Certified", imageUrl: null },
            { name: "Google Ads Certified", imageUrl: null },
          ],
          gpa: 3.6,
          availability: "Available",
          preferredDuration: "6 months",
        },
        {
          id: 3,
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@student.edu",
          program: "Bachelor of Science in Computer Science",
          yearLevel: "2nd Year",
          location: "Makati, Philippines",
          profilePicUrl: null,
          skills: ["Python", "Machine Learning", "Data Analysis", "SQL"],
          softSkills: [
            "Analytical Thinking",
            "Research",
            "Attention to Detail",
          ],
          badges: [
            { name: "Data Science Enthusiast", imageUrl: null },
            { name: "Python Developer", imageUrl: null },
          ],
          certificates: [
            { name: "IBM Data Science Professional", imageUrl: null },
            { name: "Microsoft Azure Fundamentals", imageUrl: null },
          ],
          gpa: 3.9,
          availability: "Available",
          preferredDuration: "4 months",
        },
        {
          id: 4,
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@student.edu",
          program: "Bachelor of Science in Tourism Management",
          yearLevel: "3rd Year",
          location: "Cebu, Philippines",
          profilePicUrl: null,
          skills: ["Event Planning", "Customer Service", "Tourism Management"],
          softSkills: ["Hospitality", "Cultural Awareness", "Communication"],
          badges: [
            { name: "Tourism Expert", imageUrl: null },
            { name: "Event Planner", imageUrl: null },
          ],
          certificates: [
            { name: "Tourism Professional Certificate", imageUrl: null },
            { name: "Event Management Certified", imageUrl: null },
          ],
          gpa: 3.7,
          availability: "Available",
          preferredDuration: "3 months",
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
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesProgram =
      programFilter === "all" ||
      student.program.toLowerCase().includes(programFilter.toLowerCase());

    const matchesYear =
      yearFilter === "all" || student.yearLevel === yearFilter;

    return matchesSearch && matchesProgram && matchesYear;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-white rounded-lg shadow-sm"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="h-80 bg-white rounded-lg shadow-sm"></div>
              <div className="h-80 bg-white rounded-lg shadow-sm"></div>
              <div className="h-80 bg-white rounded-lg shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Browse Interns
              </h1>
              <p className="text-lg text-gray-600">
                Discover talented students for your internship opportunities
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{filteredStudents.length} students found</span>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white shadow-lg border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, program, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="all">All Programs</option>
                    <option value="information system">
                      Information System
                    </option>
                    <option value="business">Business Administration</option>
                    <option value="computer science">Computer Science</option>
                    <option value="tourism">Tourism Management</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="all">All Years</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="bg-white shadow-lg border-gray-200 hover:shadow-xl transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={student.profilePicUrl}
                      alt={`${student.firstName} ${student.lastName}`}
                    />
                    <AvatarFallback className="bg-gray-900 text-white">
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {student.firstName} {student.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{student.program}</p>
                    <p className="text-xs text-gray-500">{student.yearLevel}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {student.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    GPA: {student.gpa}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Available for {student.preferredDuration}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {student.skills.slice(0, 4).map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {student.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{student.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    {student.badges.length} badges
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    {student.certificates.length} certificates
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card className="bg-white shadow-lg border-gray-200">
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No students found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria to find more
                students.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BrowseInterns;

