import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileActionsProps {
  variant: "mobile" | "desktop";
}

export const ProfileActions = ({ variant }: ProfileActionsProps) => {
  const navigate = useNavigate();

  const goToMyResults = () => {
    navigate("/results", { state: { myResultsOnly: true } });
  };

  const goToAddTest = () => {
    navigate("/add");
  };

  if (variant === "mobile") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={goToMyResults}
        >
          <ListPlus className="w-5 h-5 text-primary" />
          <span className="text-xs sm:text-sm">My Results</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={goToAddTest}
        >
          <PlusCircle className="w-5 h-5 text-primary" />
          <span className="text-xs sm:text-sm">Add Test</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-start h-auto py-4"
        onClick={goToMyResults}
      >
        <ListPlus className="w-5 h-5 text-primary mr-3" />
        <span>View My Tests</span>
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start h-auto py-4"
        onClick={goToAddTest}
      >
        <PlusCircle className="w-5 h-5 text-primary mr-3" />
        <span>Add New Test</span>
      </Button>
    </div>
  );
};
