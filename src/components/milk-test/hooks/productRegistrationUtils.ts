
import { supabase } from "@/integrations/supabase/client";
import { FormSetters, ProductSubmitParams } from "./types";

export const resetFormState = ({
  setBrandId,
  setProductName,
  setNameId,
  setSelectedProductTypes,
  setIsBarista,
  setSelectedFlavors,
  setIsSubmitting
}: FormSetters) => {
  setBrandId("");
  setProductName("");
  setNameId(null);
  setSelectedProductTypes([]);
  setIsBarista(false);
  setSelectedFlavors([]);
  setIsSubmitting(false);
};

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
}: ProductSubmitParams) => {
  // First check if product already exists with this brand and name_id
  let finalNameId = nameId;

  try {
    // If name doesn't exist yet, create it
    if (!finalNameId) {
      const { data: newName, error: nameError } = await supabase
        .from('names')
        .insert({ name: productName.trim() })
        .select()
        .single();
      
      if (nameError) {
        console.error('Error adding product name:', nameError);
        return; // Exit early without showing an error toast
      }
      
      finalNameId = newName.id;
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
      console.error('Error adding product:', productError);
      return; // Exit early without showing an error toast
    }

    // Add product types if selected
    if (selectedProductTypes.length > 0 || isBarista) {
      await addProductTypes(newProduct.id, selectedProductTypes, isBarista);
    }
    
    // Add flavors if selected
    if (selectedFlavors.length > 0) {
      await addProductFlavors(newProduct.id, selectedFlavors);
    }
    
    toast({
      title: "Product added",
      description: "New product added successfully!"
    });
    
    onSuccess(newProduct.id, brandId);
    onOpenChange(false);
  } catch (error) {
    console.error('Global error in product submission:', error);
    // Don't show any error toast, just log it
  }
};

// Helper function to add product types
const addProductTypes = async (
  productId: string, 
  selectedTypes: string[], 
  isBarista: boolean
) => {
  if (selectedTypes.length === 0 && !isBarista) return;
  
  try {
    const finalProductTypes = isBarista 
      ? [...selectedTypes, "barista"] 
      : selectedTypes;
    
    const { data: propertyData, error: propertyLookupError } = await supabase
      .from('properties')
      .select('id, key')
      .in('key', finalProductTypes);
    
    if (propertyLookupError) {
      console.error('Error looking up property IDs:', propertyLookupError);
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
      }
    }
  } catch (error) {
    console.error('Error in addProductTypes:', error);
  }
};

// Helper function to add product flavors
const addProductFlavors = async (productId: string, selectedFlavors: string[]) => {
  if (selectedFlavors.length === 0) return;
  
  try {
    // Get the flavor IDs from their keys
    const { data: flavorData, error: flavorLookupError } = await supabase
      .from('flavors')
      .select('id, key')
      .in('key', selectedFlavors);
    
    if (flavorLookupError) {
      console.error('Error looking up flavor IDs:', flavorLookupError);
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
      }
    }
  } catch (error) {
    console.error('Error in addProductFlavors:', error);
  }
};
