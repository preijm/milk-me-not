import React from "react";
import { Badge } from "@/components/ui/badge";
import { Coffee, Tag, Droplet } from "lucide-react";

export const BadgeLegend = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      <span className="font-medium">Legend:</span>
      <div className="flex items-center gap-1.5">
        <Badge variant="barista" className="text-xs py-0.5">
          <Coffee className="w-3 h-3 mr-1" />
          Barista
        </Badge>
        <span className="text-xs">= Barista edition</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge variant="category" className="text-xs py-0.5">
          <Tag className="w-3 h-3 mr-1" />
          Type
        </Badge>
        <span className="text-xs">= Milk type</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Badge variant="flavor" className="text-xs py-0.5">
          <Droplet className="w-3 h-3 mr-1" />
          Flavor
        </Badge>
        <span className="text-xs">= Flavored</span>
      </div>
    </div>
  );
};
