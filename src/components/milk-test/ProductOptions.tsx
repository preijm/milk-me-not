
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface ProductOptionsProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
}

export const ProductOptions = ({
  selectedTypes,
  setSelectedTypes,
}: ProductOptionsProps) => {
  const { data: productProperties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('ordering', { ascending: true });
      
      return data || [];
    },
  });

  const handleTypeToggle = (typeKey: string) => {
    if (selectedTypes.includes(typeKey)) {
      setSelectedTypes(selectedTypes.filter(t => t !== typeKey));
    } else {
      setSelectedTypes([...selectedTypes, typeKey]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3.5">
      {productProperties.map((property) => (
        <Badge
          key={property.key}
          variant="category"
          className={`cursor-pointer transition-all ${
            selectedTypes.includes(property.key)
              ? 'bg-primary text-primary-foreground border-primary'
              : ''
          }`}
          onClick={() => handleTypeToggle(property.key)}
        >
          {property.name}
        </Badge>
      ))}
    </div>
  );
};
