import React from "react";

interface TimelineContainerProps {
  children: React.ReactNode;
}

export const TimelineContainer = ({ children }: TimelineContainerProps) => {
  return (
    <div className="relative">
      {/* Timeline line - subtle background element */}
      <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-primary/10 -translate-x-1/2 hidden sm:block -z-10" />
      {children}
    </div>
  );
};
