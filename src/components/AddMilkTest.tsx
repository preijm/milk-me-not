import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Country codes for flag emojis
const countries = [
  { code: "US", name: "United States" },
  { code: "NL", name: "Netherlands" },
  { code: "GB", name: "United Kingdom" },
  { code: "IT", name: "Italy" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "CA", name: "Canada" },
].sort((a, b) => a.name.localeCompare(b.name));

export const AddMilkTest = () => {
  const [rating, setRating] = useState(0);
  const [brand, setBrand] = useState("");
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [notes, setNotes] = useState("");
  const [isBarista, setIsBarista] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [brands, setBrands] = useState<string[]>([]);
  const [allIngredients, setAllIngredients] = useState<string[]>([
    "Milk",
    "Water",
    "Oats",
    "Almonds",
    "Soy",
    "Coconut",
    "Cashews",
    "Rice",
    "Pea Protein",
  ]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoadingBrands(true);
      try {
        console.log("Fetching unique brands...");
        const { data, error } = await supabase
          .from('milk_tests')
          .select('brand')
          .order('brand');

        if (error) throw error;

        if (data) {
          const uniqueBrands = Array.from(new Set(data.map(item => item.brand))).filter(Boolean);
          console.log("Fetched brands:", uniqueBrands);
          setBrands(uniqueBrands);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast({
          title: "Error",
          description: "Failed to load brands. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!brand || !rating) {
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single();

      const { error } = await supabase
        .from('milk_tests')
        .insert({
          brand,
          product_name: productName,
          ingredients,
          country,
          is_barista: isBarista,
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

  const handleAddIngredient = () => {
    if (newIngredient && !allIngredients.includes(newIngredient)) {
      setAllIngredients(prev => [...prev, newIngredient]);
    }
    if (newIngredient && !ingredients.includes(newIngredient)) {
      setIngredients(prev => [...prev, newIngredient]);
    }
    setNewIngredient("");
  };

  const toggleIngredient = (ingredient: string) => {
    setIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const getCountryFlag = (code: string) => {
    const codePoints = code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-md p-6 animate-fade-up">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Taste Test</h2>
      
      <div className="flex flex-col space-y-2">
        <Popover open={brandOpen} onOpenChange={setBrandOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={brandOpen}
              className="justify-between"
            >
              {brand || "Select brand..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput 
                placeholder="Search brands..."
                onValueChange={setBrand}
              />
              <CommandEmpty>No brand found. Type to add a new one.</CommandEmpty>
              <CommandGroup>
                {!isLoadingBrands && brands.map((existingBrand) => (
                  <CommandItem
                    key={existingBrand}
                    value={existingBrand}
                    onSelect={(currentValue) => {
                      setBrand(currentValue);
                      setBrandOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        brand === existingBrand ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {existingBrand}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Input
          placeholder="Product name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Ingredients</label>
        <div className="flex flex-wrap gap-2">
          {allIngredients.map((ingredient) => (
            <div
              key={ingredient}
              className={cn(
                "px-3 py-1 rounded-full cursor-pointer text-sm transition-colors",
                ingredients.includes(ingredient)
                  ? "bg-cream-300 text-gray-800"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              onClick={() => toggleIngredient(ingredient)}
            >
              {ingredient}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add new ingredient"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddIngredient}
            disabled={!newIngredient}
          >
            Add
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={countryOpen}
              className="justify-between"
            >
              {country ? `${getCountryFlag(country)} ${countries.find(c => c.code === country)?.name}` : "Select country (optional)"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search countries..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {countries.map((c) => (
                  <CommandItem
                    key={c.code}
                    value={c.code}
                    onSelect={() => {
                      setCountry(c.code);
                      setCountryOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        country === c.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {getCountryFlag(c.code)} {c.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="barista"
          checked={isBarista}
          onCheckedChange={(checked) => setIsBarista(checked as boolean)}
        />
        <label
          htmlFor="barista"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Barista Version
        </label>
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