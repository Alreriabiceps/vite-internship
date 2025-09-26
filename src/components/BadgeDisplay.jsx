import React from "react";
import { Star } from "lucide-react";

const BadgeDisplay = ({ badges, isEditing = false }) => {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-xs text-gray-500">
        {isEditing ? "Enter badge name and URL" : "No badges yet"}
      </div>
    );
  }

  // Handle both old format (comma-separated string) and new format (array of objects)
  let badgeList = [];
  if (typeof badges === "string") {
    badgeList = badges
      .split(",")
      .map((badge) => ({ name: badge.trim(), url: "" }))
      .filter((badge) => badge.name.length > 0);
  } else if (Array.isArray(badges)) {
    badgeList = badges.filter(
      (badge) => badge.name && badge.name.trim().length > 0
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badgeList.map((badge, index) => (
        <div key={index} className="group relative inline-flex items-center">
          {badge.imageUrl ? (
            // Show uploaded image
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors">
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="h-4 w-4 object-cover rounded-full"
              />
              <span className="text-gray-800">{badge.name}</span>
            </div>
          ) : badge.url ? (
            // Show with URL link
            <a
              href={badge.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs hover:bg-yellow-200 transition-colors"
              title={badge.name}
            >
              <Star className="h-3 w-3" />
              <span>{badge.name}</span>
            </a>
          ) : (
            // Show without URL
            <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
              <Star className="h-3 w-3" />
              <span>{badge.name}</span>
            </div>
          )}
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            {badge.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BadgeDisplay;
