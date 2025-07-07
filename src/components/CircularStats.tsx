import React from "react";
import { Badge } from "@/components/ui/badge";
import { getCircularScoreVariant } from "@/lib/scoreUtils";
import { formatScore } from "@/lib/scoreFormatter";

interface CircularStatsProps {
  score: number;
  testCount: number;
}

export const CircularStats = ({ score, testCount }: CircularStatsProps) => {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-2 font-medium">Score</div>
        <Badge variant={getCircularScoreVariant(score)}>
          {formatScore(score)}
        </Badge>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-500 mb-2 font-medium">Tests</div>
        <Badge variant="circularTestCount">
          {testCount}
        </Badge>
      </div>
    </div>
  );
};