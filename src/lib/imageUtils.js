// Utility function to get course logo images
export const getCourseLogo = (program) => {
  if (!program) return null;
  const programLower = program.toLowerCase();

  // Map program names to image filenames
  const courseImages = {
    business: "BUSINES ADD.png",
    criminal: "CRIMINAL JUSTICE.png",
    education: "EDUCATION.png",
    information: "INFORMATION SYSTEM.png",
    computer: "INFORMATION SYSTEM.png",
    maritime: "MARITIME.png",
    nurse: "NURSE.png",
    nursing: "NURSE.png",
    tourism: "TOURISM.png",
  };

  // Find matching program
  for (const [key, imageName] of Object.entries(courseImages)) {
    if (programLower.includes(key)) {
      // Try different path approaches
      const baseUrl = import.meta.env.BASE_URL || "/";
      return `${baseUrl}${imageName}`;
    }
  }

  return null;
};

// Alternative approach using direct public folder access
export const getCourseLogoDirect = (program) => {
  if (!program) return null;
  const programLower = program.toLowerCase();

  if (programLower.includes("business")) return "/BUSINES ADD.png";
  if (programLower.includes("criminal")) return "/CRIMINAL JUSTICE.png";
  if (programLower.includes("education")) return "/EDUCATION.png";
  if (
    programLower.includes("information") ||
    programLower.includes("computer")
  ) {
    return "/INFORMATION SYSTEM.png";
  }
  if (programLower.includes("maritime")) return "/MARITIME.png";
  if (programLower.includes("nurse") || programLower.includes("nursing")) {
    return "/NURSE.png";
  }
  if (programLower.includes("tourism")) return "/TOURISM.png";

  return null;
};

// Try using window.location.origin for absolute URLs
export const getCourseLogoAbsolute = (program) => {
  if (!program) return null;
  const programLower = program.toLowerCase();

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (programLower.includes("business")) return `${baseUrl}/BUSINES ADD.png`;
  if (programLower.includes("criminal"))
    return `${baseUrl}/CRIMINAL JUSTICE.png`;
  if (programLower.includes("education")) return `${baseUrl}/EDUCATION.png`;
  if (
    programLower.includes("information") ||
    programLower.includes("computer")
  ) {
    return `${baseUrl}/INFORMATION SYSTEM.png`;
  }
  if (programLower.includes("maritime")) return `${baseUrl}/MARITIME.png`;
  if (programLower.includes("nurse") || programLower.includes("nursing")) {
    return `${baseUrl}/NURSE.png`;
  }
  if (programLower.includes("tourism")) return `${baseUrl}/TOURISM.png`;

  return null;
};
