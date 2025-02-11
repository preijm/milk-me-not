
import { Checkbox } from "@/components/ui/checkbox";
import { Coffee, CupSoda } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProductType {
  key: string;
  name: string;
  ordering: number;
}

interface ProductOptionsProps {
  isBarista: boolean;
  setIsBarista: (checked: boolean) => void;
  isUnsweetened: boolean;
  setIsUnsweetened: (checked: boolean) => void;
  isSpecialEdition: boolean;
  setIsSpecialEdition: (checked: boolean) => void;
  isNoSugar: boolean;
  setIsNoSugar: (checked: boolean) => void;
}

export const ProductOptions = ({
  isBarista,
  setIsBarista,
  isUnsweetened,
  setIsUnsweetened,
  isSpecialEdition,
  setIsSpecialEdition,
  isNoSugar,
  setIsNoSugar,
}: ProductOptionsProps) => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchProductTypes = async () => {
      const { data } = await supabase
        .from('product_types')
        .select('*')
        .order('ordering');
      
      if (data) {
        setProductTypes(data);
      }
    };

    fetchProductTypes();
  }, []);

  const getCheckboxState = (key: string) => {
    switch (key) {
      case 'barista':
        return isBarista;
      case 'no_sugar':
        return isNoSugar;
      case 'unsweetened':
        return isUnsweetened;
      case 'special_edition':
        return isSpecialEdition;
      default:
        return false;
    }
  };

  const handleCheckboxChange = (key: string, checked: boolean) => {
    switch (key) {
      case 'barista':
        setIsBarista(checked);
        break;
      case 'no_sugar':
        setIsNoSugar(checked);
        break;
      case 'unsweetened':
        setIsUnsweetened(checked);
        break;
      case 'special_edition':
        setIsSpecialEdition(checked);
        break;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Coffee className="w-5 h-5 text-amber-800" />
        <CupSoda className="w-5 h-5 text-gray-900" />
      </div>
      <div className="flex flex-wrap gap-6">
        {productTypes.map((type) => (
          <div key={type.key} className="flex items-center space-x-2">
            <Checkbox
              id={type.key}
              checked={getCheckboxState(type.key)}
              onCheckedChange={(checked) => handleCheckboxChange(type.key, checked as boolean)}
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
