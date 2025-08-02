
export interface UseProductRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (productId: string, brandId: string) => void;
  editProductId?: string;
  productDetails?: any;
}

export interface FormState {
  brandId: string;
  productName: string;
  nameId: string | null;
  selectedProductTypes: string[];
  isBarista: boolean;
  selectedFlavors: string[];
  isSubmitting: boolean;
}

export interface FormSetters {
  setBrandId: (id: string) => void;
  setProductName: (name: string) => void;
  setNameId: (id: string | null) => void;
  setSelectedProductTypes: (types: string[]) => void;
  setIsBarista: (isBarista: boolean) => void;
  setSelectedFlavors: (flavors: string[]) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

export interface Flavor {
  id: string;
  name: string;
  key: string;
}

export interface ProductSubmitParams {
  brandId: string;
  productName: string;
  nameId: string | null;
  selectedProductTypes: string[];
  isBarista: boolean;
  selectedFlavors: string[];
  toast: any;
  onSuccess: (productId: string, brandId: string) => void;
  onOpenChange: (open: boolean) => void;
  editProductId?: string;
}

export interface ProductSubmitResult {
  productId: string | null;
  isDuplicate: boolean;
}
