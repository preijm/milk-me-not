import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const AddMilkTest = () => {
  const [rating, setRating] = useState(0);
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !type || !rating) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add milk tests",
          variant: "destructive",
        });
        return;
      }

      // Get user's profile to get username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single();

      const { error } = await supabase
        .from('milk_tests')
        .insert({
          brand,
          type,
          rating,
          notes,
          user_id: userData.user.id,
          username: profileData?.username
        });

      if (error) throw error;

      toast({
        title: "Test added!",
        description: "Your milk taste test has been recorded.",
      });

      setBrand("");
      setType("");
      setRating(0);
      setNotes("");
      
      navigate("/dashboard");
    } catch (error) {
      console.error('Error adding milk test:', error);
      toast({
        title: "Error",
        description: "Failed to add milk test. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <span
            key={value}
            className={`text-xl cursor-pointer ${
              value <= rating ? "" : "opacity-20"
            }`}
            onClick={() => setRating(value)}
          >
            🥛
          </span>
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

      <Button 
        type="submit" 
        className="w-full bg-cream-300 hover:bg-cream-200 text-milk-500"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Adding..." : "Add Result"}
      </Button>
    </form>
  );
};