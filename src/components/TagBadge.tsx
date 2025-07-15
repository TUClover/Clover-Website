import { ProgrammingTag } from "@/constants/tags";
import { Badge } from "./ui/badge";

interface TagBadgeProps {
  tag: ProgrammingTag;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const TagBadge = ({ tag, className, size = "md" }: TagBadgeProps) => {
  const getTagDisplay = (tag: ProgrammingTag) => {
    const tagConfig = {
      JAVASCRIPT: { label: "JavaScript", color: "text-yellow-700" },
      TYPESCRIPT: { label: "TypeScript", color: "text-blue-700" },
      PYTHON: { label: "Python", color: "text-green-700" },
      JAVA: { label: "Java", color: "text-orange-700" },
      CPP: { label: "C++", color: "text-blue-700" },
      CSHARP: { label: "C#", color: "text-purple-700" },
      GO: { label: "Go", color: "text-cyan-700" },
      RUST: { label: "Rust", color: "text-orange-700" },
      PHP: { label: "PHP", color: "text-indigo-700" },
      RUBY: { label: "Ruby", color: "text-red-700" },
      SWIFT: { label: "Swift", color: "text-orange-700" },
      KOTLIN: { label: "Kotlin", color: "text-purple-700" },

      // Frontend
      HTML: { label: "HTML", color: "text-orange-600" },
      CSS: { label: "CSS", color: "text-blue-600" },
      SASS: { label: "Sass", color: "text-pink-700" },
      REACT: { label: "React", color: "text-cyan-700" },
      VUE: { label: "Vue.js", color: "text-green-700" },
      ANGULAR: { label: "Angular", color: "text-red-700" },
      SVELTE: { label: "Svelte", color: "text-orange-700" },
      NEXTJS: { label: "Next.js", color: "text-gray-700" },

      // Backend
      NODE_JS: { label: "Node.js", color: "text-green-700" },
      EXPRESS: { label: "Express", color: "text-gray-700" },
      DJANGO: { label: "Django", color: "text-green-700" },
      FLASK: { label: "Flask", color: "text-blue-700" },
      SPRING: { label: "Spring", color: "text-green-700" },
      LARAVEL: { label: "Laravel", color: "text-red-700" },
      RAILS: { label: "Rails", color: "text-red-700" },

      // Databases
      MONGODB: { label: "MongoDB", color: "text-green-700" },
      POSTGRESQL: { label: "PostgreSQL", color: "text-blue-700" },
      MYSQL: { label: "MySQL", color: "text-blue-700" },
      REDIS: { label: "Redis", color: "text-red-700" },

      // DevOps & Cloud
      DOCKER: { label: "Docker", color: "text-blue-700" },
      KUBERNETES: { label: "Kubernetes", color: "text-blue-700" },
      AWS: { label: "AWS", color: "text-orange-700" },
      AZURE: { label: "Azure", color: "text-blue-700" },
      GCP: { label: "Google Cloud", color: "text-blue-700" },
      GIT: { label: "Git", color: "text-orange-700" },

      // API & Architecture
      GRAPHQL: { label: "GraphQL", color: "text-pink-700" },
      REST_API: { label: "REST API", color: "text-green-700" },
      MICROSERVICES: { label: "Microservices", color: "text-purple-700" },

      // Specialized Fields
      MACHINE_LEARNING: { label: "ML", color: "text-purple-700" },
      AI: { label: "AI", color: "text-indigo-700" },
      DATA_SCIENCE: { label: "Data Science", color: "text-blue-700" },
      BLOCKCHAIN: { label: "Blockchain", color: "text-yellow-700" },

      // Development Areas
      MOBILE: { label: "Mobile", color: "text-green-700" },
      WEB_DEVELOPMENT: { label: "Web Dev", color: "text-cyan-700" },
      BACKEND: { label: "Backend", color: "text-purple-700" },
      FRONTEND: { label: "Frontend", color: "text-blue-700" },
      FULLSTACK: { label: "Full Stack", color: "text-indigo-700" },
      DEVOPS: { label: "DevOps", color: "text-orange-700" },
      TESTING: { label: "Testing", color: "text-green-700" },

      // Computer Science
      ALGORITHMS: { label: "Algorithms", color: "text-red-700" },
      DATA_STRUCTURES: { label: "Data Structures", color: "text-purple-700" },
    };

    const config = tagConfig[tag as keyof typeof tagConfig];

    if (!config) {
      return {
        label: tag
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        color: "text-gray-700",
      };
    }

    return config;
  };

  const getSizeClasses = (size: "sm" | "md" | "lg") => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-4 py-2 text-sm";
      default:
        return "px-3 py-1.5 text-xs";
    }
  };

  const { label, color } = getTagDisplay(tag);
  const sizeClasses = getSizeClasses(size);

  return (
    <Badge
      className={`
        inline-flex items-center justify-center
        rounded-full font-medium
        bg-white/90 backdrop-blur-sm border border-white/30 h-6
        ${color}
        ${sizeClasses}
        ${className || ""}
      `}
    >
      {label}
    </Badge>
  );
};

export default TagBadge;
