
import { FormSetters, ProductSubmitParams, ProductSubmitResult } from "../types";
import { addProductTypes } from "./productTypes";
import { addProductFlavors } from "./productFlavors";
import { resolveProductNameId } from "./nameResolver";
import { createNewProduct, checkDuplicateProduct, updateExistingProduct, clearProductAssociations } from "./productCreator";

/**
 * Resets all form fields to their initial state
 */
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

/**
 * Handles the submission of a new product or update of existing product
 * Returns a promise with the product ID
 */
export const handleProductSubmit = async ({
  brandId,
  productName,
  nameId,
  selectedProductTypes,
  isBarista,
  selectedFlavors,
  toast,
  onSuccess,
  onOpenChange,
  editProductId
}: ProductSubmitParams): Promise<ProductSubmitResult> => {
  let finalNameId = nameId;
  let productId = editProductId || null;

  console.log('Starting product submission with:', { 
    brandId, 
    productName, 
    nameId, 
    selectedProductTypes, 
    isBarista, 
    selectedFlavors,
    editProductId,
    isEditMode: !!editProductId
  });

  try {
    // 1. First handle the name_id resolution
    finalNameId = await resolveProductNameId(productName, finalNameId);
    
    if (editProductId) {
      // EDIT MODE: Update existing product
      console.log('Edit mode: updating existing product', editProductId);
      
      // Update the main product record
      await updateExistingProduct(editProductId, brandId, finalNameId, isBarista);
      
      // Clear existing properties and flavors
      await clearProductAssociations(editProductId);
      
      productId = editProductId;
    } else {
      // CREATE MODE: Check for duplicates and create new product
      console.log('Create mode: checking for duplicates and creating new product');
      
      const duplicateProductId = await checkDuplicateProduct(
        brandId, 
        finalNameId, 
        isBarista, 
        selectedProductTypes, 
        selectedFlavors
      );
      
      if (duplicateProductId) {
        console.log('Duplicate product found, ID:', duplicateProductId);
        return { productId: duplicateProductId, isDuplicate: true };
      }
      
      // Create a new product entry
      productId = await createNewProduct(brandId, finalNameId, isBarista);
    }
    
    // Add product types if selected
    if (selectedProductTypes.length > 0 && productId) {
      try {
        await addProductTypes(productId, selectedProductTypes, isBarista);
        console.log('Product types added successfully');
      } catch (error) {
        console.error('Failed to add product types:', error);
        // Continue with flavor addition even if types fail
      }
    }
    
    // Add flavors if selected
    if (selectedFlavors.length > 0 && productId) {
      try {
        await addProductFlavors(productId, selectedFlavors);
        console.log('Product flavors added successfully');
      } catch (error) {
        console.error('Failed to add product flavors:', error);
        // Continue even if flavor addition fails
      }
    }
    
    console.log('Product submission complete for product ID:', productId);
    
    // Call onSuccess directly with the product ID
    if (productId && onSuccess) {
      onSuccess(productId, brandId);
    }
    
    // Close the dialog if needed
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    return { productId, isDuplicate: false };
    
  } catch (error) {
    console.error('Global error in product submission:', error);
    toast({
      title: "Error",
      description: editProductId ? "Failed to update product. Please try again." : "Failed to register product. Please try again.",
      variant: "destructive"
    });
    return { productId: null, isDuplicate: false };
  }
};
