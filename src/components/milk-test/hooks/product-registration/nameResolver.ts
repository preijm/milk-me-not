
import { supabase } from "@/integrations/supabase/client";
import { normalizeName } from "@/lib/nameNormalization";

/**
 * Resolves the product name ID by either using an existing one or creating a new one
 */
export const resolveProductNameId = async (productName: string, existingNameId: string | null): Promise<string> => {
  if (existingNameId) return existingNameId;
  
  const normalized = normalizeName(productName);
  
  // If we don't have a nameId, check if the name exists in the names table (case-insensitive)
  const { data: existingNames } = await supabase
    .from('names')
    .select('id')
    .ilike('name', normalized)
    .maybeSingle();
  
  if (existingNames) {
    console.log('Found existing name:', existingNames);
    return existingNames.id;
  } 
  
  // Create a new name if it doesn't exist
  const { data: newName, error: nameError } = await supabase
    .from('names')
    .insert({ name: normalized })
    .select()
    .single();
  
  if (nameError) {
    console.error('Error adding product name:', nameError);
    throw nameError;
  }
  
  console.log('Created new name:', newName);
  return newName.id;
};
