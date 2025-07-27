import { cn } from "@/lib/utils";
import { CLOVER } from "@/components/ui/text";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";
import CloverImg from "@/assets/CLOVER.svg";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

const CloverLogo = ({
  size = "md",
  className = "",
  showText = true,
  onClick,
}: LogoProps) => {
  const sizeConfig = {
    sm: {
      image: "h-6 w-6",
      text: "text-lg",
      gap: "gap-2",
    },
    md: {
      image: "h-8 w-8",
      text: "text-2xl",
      gap: "gap-2",
    },
    lg: {
      image: "h-12 w-12",
      text: "text-4xl",
      gap: "gap-3",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn("flex items-center", config.gap, className)}
      onClick={onClick}
    >
      <img src={CloverImg} alt="Clover Logo" className={config.image} />
      {showText && <CLOVER className={cn(config.text, "font-bold")} />}
    </div>
  );
};

export default CloverLogo;

interface FloatingLogoProps {
  className?: string;
  onClick?: () => void;
}

export const FloatingLogo = ({
  className = "",
  onClick,
}: FloatingLogoProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        isScrolled
          ? "backdrop-blur-md bg-background/10 supports-[backdrop-filter]:bg-background/30 border-b shadow-sm"
          : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div
          className={cn(
            "flex items-center justify-start transition-all duration-100 ease-in-out",
            isScrolled
              ? "bg-transparent rounded-sm p-0 w-fit"
              : "backdrop-blur-md bg-black/10 rounded-lg p-3 w-fit"
          )}
        >
          <CloverLogo
            size={isMobile ? "sm" : "md"}
            className="text-white hover:opacity-80 transition-opacity cursor-pointer"
            onClick={onClick}
          />
        </div>
      </div>
    </header>
  );
};
