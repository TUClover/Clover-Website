import * as React from "react";

import { cn } from "../../lib/utils";

const Title = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-5xl font-extrabold text-text", className)}
    {...props}
  />
));
Title.displayName = "Title";

const Header = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-4xl font-bold text-center text-primary mt-8",
      className
    )}
    {...props}
  />
));
Header.displayName = "Header";

const Paragraph = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-4 text-lg text-text max-w-2xl", className)}
    {...props}
  />
));
Paragraph.displayName = "Paragraph";

const CLOVER = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "bg-clip-text text-transparent bg-gradient-to-r from-[#50B498] to-[#9CDBA6]",
      className
    )}
    {...props}
  >
    CLOVER
  </span>
));
CLOVER.displayName = "CLOVER";

export { Title, Header, Paragraph, CLOVER };
