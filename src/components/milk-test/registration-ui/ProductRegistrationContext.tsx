
import React, { createContext, useContext, useEffect } from "react";
import { 
  useProductRegistrationForm
} from "../hooks/useProductRegistrationForm";
import { UseProductRegistrationFormProps } from "../hooks/types";
import { useProductDetails } from "@/hooks/useProductDetails";
import { useAdminCheck } from "@/hooks/useAdminCheck";

// The context holds the entire state and handlers from useProductRegistrationForm
type ProductRegistrationContextType = ReturnType<typeof useProductRegistrationForm> & {
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<any>;
  refetchFlavors?: () => void;
  isEditMode: boolean;
  isAdmin: boolean;
  editProductId?: string;
};

const ProductRegistrationContext = createContext<ProductRegistrationContextType | undefined>(undefined);

export const useProductRegistration = () => {
  const context = useContext(ProductRegistrationContext);
  if (!context) {
    throw new Error("useProductRegistration must be used within a ProductRegistrationProvider");
  }
  return context;
};

interface ProductRegistrationProviderProps {
  children: React.ReactNode;
  formProps: UseProductRegistrationFormProps;
}

export const ProductRegistrationProvider: React.FC<ProductRegistrationProviderProps> = ({ 
  children, 
  formProps 
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Fetch product details if in edit mode
  const { data: productDetails } = useProductDetails(formProps.editProductId);
  
  // Check admin status
  const { data: isAdmin } = useAdminCheck();
  
  const formState = useProductRegistrationForm({
    ...formProps,
    productDetails
  });
  
  // Reset isSubmitting state when dialog opens/closes
  useEffect(() => {
    if (formProps.open) {
      // When dialog opens, ensure isSubmitting is false
      setIsSubmitting(false);
    }
  }, [formProps.open]);
  
  const value = {
    ...formState,
    isSubmitting,
    setIsSubmitting,
    // The handleSubmit will be overridden in the Dialog component
    handleSubmit: async (_e: React.FormEvent) => Promise.resolve(null),
    refetchFlavors: formState.flavorQuery?.refetch,
    isEditMode: !!formProps.editProductId,
    isAdmin: isAdmin || false,
    editProductId: formProps.editProductId
  };
  
  return (
    <ProductRegistrationContext.Provider value={value}>
      {children}
    </ProductRegistrationContext.Provider>
  );
};
