
// This file is now deprecated as validation is handled directly in the ProductRegistrationDialog component

import { useToast } from "@/hooks/use-toast";

export const useFormValidation = () => {
  const { toast } = useToast();

  // For backward compatibility only
  const validateForm = (brandId: string, productName: string): boolean => {
    return true; // Always return true as validation is now handled elsewhere
  };

  return { validateForm };
};
