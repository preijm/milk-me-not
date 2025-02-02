import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Star } from "lucide-react";

export const AddMilkTest = ({ onAdd }: { onAdd: (result: any) => void }) => {
  const [rating, setRating] = useState(0);
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !type || !rating) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newResult = {
      id: Date.now(),
      brand,
      type,
      rating,
      notes,
      date: new Date().toLocaleDateString(),
    };

    onAdd(newResult);
    toast({
      title: "Test added!",
      description: "Your milk taste test has been recorded.",
    });

    setBrand("");
    setType("");
    setRating(0);
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Taste Test</h2>
      
      <div>
        <Input
          placeholder="Brand name"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <Input
          placeholder="Type (e.g., Whole, 2%, Oat)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 cursor-pointer ${
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>

      <div>
        <Textarea
          placeholder="Tasting notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full"
        />
      </div>

      <Button type="submit" className="w-full bg-cream-300 hover:bg-cream-200 text-milk-500">
        Add Result
      </Button>
    </form>
  );
};