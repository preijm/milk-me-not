import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface TimelineItemProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  delay?: number;
  reverse?: boolean;
  className?: string;
}

export const TimelineItem = ({
  icon: Icon,
  title,
  children,
  delay = 0,
  reverse = false,
  className = "",
}: TimelineItemProps) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      <div
        className={`flex items-start gap-4 sm:gap-8 ${
          reverse ? "sm:flex-row-reverse" : ""
        }`}
      >
        <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center relative z-10">
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
        </div>
        <div className="flex-1 bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </motion.div>
  );
};
