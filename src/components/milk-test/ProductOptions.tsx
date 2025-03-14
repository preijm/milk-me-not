
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
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
    queryKey: ['product_types'],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_types')
        .select('*')
        .order('ordering', { ascending: true });
      
      return data || [];
    },
  });

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes([...selectedTypes, type]);
    } else {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        {productProperties.map((type) => (
          <div key={type.key} className="flex items-center space-x-2">
            <Checkbox
              id={type.key}
              checked={selectedTypes.includes(type.key)}
              onCheckedChange={(checked) => handleTypeChange(type.key, checked as boolean)}
            />
            <label
              htmlFor={type.key}
              className="text-sm leading-none text-gray-600"
            >
              {type.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
