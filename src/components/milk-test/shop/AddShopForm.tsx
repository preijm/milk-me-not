
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddShopFormProps {
  newShopName: string;
  setNewShopName: (name: string) => void;
  selectedCountryCode: string;
  setSelectedCountryCode: (code: string) => void;
  onAdd: () => void;
  countries: { code: string; name: string }[];
}

export const AddShopForm = ({
  newShopName,
  setNewShopName,
  selectedCountryCode,
  setSelectedCountryCode,
  onAdd,
  countries,
}: AddShopFormProps) => {
  return (
    <div className="space-y-4">
      <Input
        placeholder="Shop name"
        value={newShopName}
        onChange={(e) => setNewShopName(e.target.value)}
        className="w-full"
      />
      <Select
        value={selectedCountryCode}
        onValueChange={setSelectedCountryCode}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name} ({country.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={onAdd}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Add Shop
      </Button>
    </div>
  );
};
