
import { useToast } from "@/hooks/use-toast";

export const useFormValidation = () => {
  const { toast } = useToast();

  const validateForm = (brandId: string, productName: string): boolean => {
    // Create a list of missing fields
    const missingFields = [];
    
    if (!brandId || brandId.trim() === '') {
      missingFields.push("brand");
    }
    
    if (!productName || productName.trim() === '') {
      missingFields.push("product name");
    }
    
    // If there are missing fields, show a toast with the specific missing fields
    if (missingFields.length > 0) {
      let description = "";
      
      if (missingFields.length === 1) {
        description = `Please enter: ${missingFields[0]}`;
      } else {
        description = `Please enter: ${missingFields.join(" and ")}`;
      }
      
      toast({
        title: "Missing required fields",
        description: description,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  return { validateForm };
};
