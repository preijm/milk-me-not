
import { supabase } from "@/integrations/supabase/client";

/**
 * Updates an existing product in the database
 */
export const updateExistingProduct = async (
  productId: string,
  brandId: string, 
  nameId: string, 
  isBarista: boolean
): Promise<void> => {
  console.log('Updating existing product:', { productId, brandId, nameId, isBarista });
  
  const { error: productError } = await supabase
    .from('products')
    .update({
      brand_id: brandId,
      name_id: nameId,
      is_barista: isBarista
    })
    .eq('id', productId);
  
  if (productError) {
    console.error('Error updating product:', productError);
    throw productError;
  }
  
  console.log('Product updated successfully');
};

/**
 * Removes existing product properties and flavors before updating
 */
export const clearProductAssociations = async (productId: string): Promise<void> => {
  console.log('Clearing existing product associations for:', productId);
  
  // Remove existing properties
  const { error: propsError } = await supabase
    .from('product_properties')
    .delete()
    .eq('product_id', productId);
  
  if (propsError) {
    console.error('Error removing existing properties:', propsError);
    throw propsError;
  }
  
  // Remove existing flavors
  const { error: flavorsError } = await supabase
    .from('product_flavors')
    .delete()
    .eq('product_id', productId);
  
  if (flavorsError) {
    console.error('Error removing existing flavors:', flavorsError);
    throw flavorsError;
  }
  
  console.log('Product associations cleared successfully');
};

/**
 * Checks if a product with the same brand, name, barista status, flavors and properties already exists
 */
export const checkDuplicateProduct = async (
  brandId: string, 
  nameId: string, 
  isBarista: boolean,
  selectedProductTypes: string[],
  selectedFlavors: string[]
): Promise<string | null> => {
  console.log('Checking for duplicate product:', { brandId, nameId, isBarista, selectedProductTypes, selectedFlavors });
  
  // First find if a product with the same brand and name exists
  const { data: existingProducts, error: productError } = await supabase
    .from('products')
    .select('id, is_barista')
    .eq('brand_id', brandId)
    .eq('name_id', nameId);
  
  if (productError) {
    console.error('Error checking for duplicate products:', productError);
    throw productError;
  }
  
  if (!existingProducts || existingProducts.length === 0) {
    // No products with this brand and name
    return null;
  }
  
  console.log('Found existing products with same brand and name:', existingProducts);
  
  // For each existing product, check if it has the same barista status, properties and flavors
  for (const product of existingProducts) {
    // Skip if barista status is different
    if (product.is_barista !== isBarista) {
      continue;
    }
    
    // Get properties for this product
    const { data: productProperties, error: propError } = await supabase
      .from('product_properties')
      .select('property_id, properties!inner(key)')
      .eq('product_id', product.id);
    
    if (propError) {
      console.error('Error fetching product properties:', propError);
      continue; // Continue checking other products
    }
    
    // Get property keys for this product
    const existingPropertyKeys = productProperties?.map(prop => prop.properties.key) || [];
    
    // Sort both arrays for consistent comparison
    const sortedExistingProps = [...existingPropertyKeys].sort();
    const sortedSelectedProps = [...selectedProductTypes].sort();
    
    // Compare property arrays - if they're different, this isn't a duplicate
    if (JSON.stringify(sortedExistingProps) !== JSON.stringify(sortedSelectedProps)) {
      continue;
    }
    
    // Get flavors for this product
    const { data: productFlavors, error: flavorError } = await supabase
      .from('product_flavors')
      .select('flavor_id, flavors!inner(key)')
      .eq('product_id', product.id);
    
    if (flavorError) {
      console.error('Error fetching product flavors:', flavorError);
      continue; // Continue checking other products
    }
    
    // Get flavor keys for this product
    const existingFlavorKeys = productFlavors?.map(flavor => flavor.flavors.key) || [];
    
    // Sort both arrays for consistent comparison
    const sortedExistingFlavors = [...existingFlavorKeys].sort();
    const sortedSelectedFlavors = [...selectedFlavors].sort();
    
    // Compare flavor arrays - if they're different, this isn't a duplicate
    if (JSON.stringify(sortedExistingFlavors) !== JSON.stringify(sortedSelectedFlavors)) {
      continue;
    }
    
    // If we've made it here, we've found a duplicate
    console.log('Found duplicate product:', product.id);
    return product.id;
  }
  
  // No duplicates found
  return null;
};

/**
 * Creates a new product in the database
 */
export const createNewProduct = async (brandId: string, nameId: string, isBarista: boolean): Promise<string> => {
  console.log('Creating new product with:', { brandId, nameId, isBarista });
  
  const { data: newProduct, error: productError } = await supabase
    .from('products')
    .insert({
      brand_id: brandId,
      name_id: nameId,
      is_barista: isBarista
    })
    .select()
    .single();
  
  if (productError) {
    console.error('Error adding product:', productError);
    throw productError;
  }
  
  console.log('New product created:', newProduct);
  return newProduct.id;
};
