
import { supabase } from "@/integrations/supabase/client";

interface FormSetters {
  setBrandId: (id: string) => void;
  setProductName: (name: string) => void;
  setNameId: (id: string | null) => void;
  setSelectedProductTypes: (types: string[]) => void;
  setIsBarista: (isBarista: boolean) => void;
  setSelectedFlavors: (flavors: string[]) => void;
}

export const resetFormState = ({
  setBrandId,
  setProductName,
  setNameId,
  setSelectedProductTypes,
  setIsBarista,
  setSelectedFlavors
}: FormSetters) => {
  setBrandId("");
  setProductName("");
  setNameId(null);
  setSelectedProductTypes([]);
  setIsBarista(false);
  setSelectedFlavors([]);
};

interface SubmitProps {
  brandId: string;
  productName: string;
  nameId: string | null;
  selectedProductTypes: string[];
  isBarista: boolean;
  selectedFlavors: string[];
  toast: any;
  onSuccess: (productId: string, brandId: string) => void;
  onOpenChange: (open: boolean) => void;
}

export const handleProductSubmit = async ({
  brandId,
  productName,
  nameId,
  selectedProductTypes,
  isBarista,
  selectedFlavors,
  toast,
  onSuccess,
  onOpenChange
}: SubmitProps) => {
  // First check if product already exists with this brand and name_id
  let finalNameId = nameId;

  // If name doesn't exist yet, create it
  if (!finalNameId) {
    const { data: newName, error: nameError } = await supabase
      .from('names')
      .insert({ name: productName.trim() })
      .select()
      .single();
    
    if (nameError) {
      console.error('Error adding product name:', nameError);
      // Continue even if name addition fails, but don't show error toast
    } else {
      finalNameId = newName.id;
    }
  }

  // Once we have a name_id, check if the product exists
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id')
    .eq('name_id', finalNameId)
    .eq('brand_id', brandId)
    .maybeSingle();

  // If product exists, select it instead of showing an error
  if (existingProduct) {
    toast({
      title: "Product exists",
      description: "This product already exists and has been selected"
    });
    onSuccess(existingProduct.id, brandId);
    onOpenChange(false);
    return;
  }

  // Create the new product
  const { data: newProduct, error: productError } = await supabase
    .from('products')
    .insert({
      brand_id: brandId,
      name_id: finalNameId
    })
    .select()
    .single();
  
  if (productError) {
    // Don't show an error toast here, just log the error
    console.error('Error adding product:', productError);
    throw productError;
  }

  // Add product types if selected
  await addProductTypes(newProduct.id, selectedProductTypes, isBarista);
  
  // Add flavors if selected
  await addProductFlavors(newProduct.id, selectedFlavors);
  
  toast({
    title: "Product added",
    description: "New product added successfully!"
  });
  
  onSuccess(newProduct.id, brandId);
  onOpenChange(false);
};

// Helper function to add product types
const addProductTypes = async (
  productId: string, 
  selectedTypes: string[], 
  isBarista: boolean
) => {
  if (selectedTypes.length === 0 && !isBarista) return;
  
  const finalProductTypes = isBarista 
    ? [...selectedTypes, "barista"] 
    : selectedTypes;
  
  const { data: propertyData, error: propertyLookupError } = await supabase
    .from('properties')
    .select('id, key')
    .in('key', finalProductTypes);
  
  if (propertyLookupError) {
    console.error('Error looking up property IDs:', propertyLookupError);
    // Just log the error, don't show error toast
    return;
  } 
  
  if (propertyData && propertyData.length > 0) {
    // Insert product type links
    const propertyLinks = propertyData.map(property => ({
      product_id: productId,
      property_id: property.id
    }));
    
    const { error: propertiesError } = await supabase
      .from('product_properties')
      .insert(propertyLinks);
    
    if (propertiesError) {
      console.error('Error adding product properties:', propertiesError);
      // Just log the error, don't show error toast
    }
  }
};

// Helper function to add product flavors
const addProductFlavors = async (productId: string, selectedFlavors: string[]) => {
  if (selectedFlavors.length === 0) return;
  
  // Get the flavor IDs from their keys
  const { data: flavorData, error: flavorLookupError } = await supabase
    .from('flavors')
    .select('id, key')
    .in('key', selectedFlavors);
  
  if (flavorLookupError) {
    console.error('Error looking up flavor IDs:', flavorLookupError);
    // Just log the error, don't show error toast
    return;
  } 
  
  if (flavorData && flavorData.length > 0) {
    const flavorLinks = flavorData.map(flavor => ({
      product_id: productId,
      flavor_id: flavor.id
    }));
    
    const { error: flavorError } = await supabase
      .from('product_flavors')
      .insert(flavorLinks);
    
    if (flavorError) {
      console.error('Error adding flavors:', flavorError);
      // Just log the error, don't show error toast
    }
  }
};
