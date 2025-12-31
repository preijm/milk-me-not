import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RatingSelect } from "../RatingSelect";
import { ResponsiveNotesArea } from "../ResponsiveNotesArea";
import { PriceInput } from "../PriceInput";
import { ShopSelect } from "../ShopSelect";
import { CountrySelect } from "../CountrySelect";
import { DrinkPreference } from "../DrinkPreference";
import { ProductInfo } from "./ProductInfo";

interface EditMilkTestFormProps {
  formState: {
    rating: number;
    notes: string;
    shop: string;
    country: string;
    priceQualityRatio: string;
    isSubmitting: boolean;
    picture: File | null;
    picturePreview: string | null;
    priceHasChanged: boolean;
    drinkPreference: string;
  };
  formSetters: {
    setRating: (rating: number) => void;
    setNotes: (notes: string) => void;
    setShop: (shop: string) => void;
    setCountry: (country: string) => void;
    setPriceQualityRatio: (price: string) => void;
    setPicture: (file: File | null) => void;
    setPicturePreview: (url: string | null) => void;
    setPriceHasChanged: (hasChanged: boolean) => void;
    setDrinkPreference: (preference: string) => void;
  };
  brand: string;
  productName?: string;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
}

export const EditMilkTestForm = ({
  formState,
  formSetters,
  brand,
  productName,
  onSubmit,
  onCancel,
  onDelete,
}: EditMilkTestFormProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isFormValid = formState.rating > 0 && formState.country && formState.country.trim() !== '';

  return (
    <form onSubmit={e => {
      e.preventDefault();
      if (isFormValid) {
        onSubmit(e);
      }
    }} className="space-y-8">
      {/* Product Information */}
      <div className="space-y-4">
        <ProductInfo brand={brand} productName={productName} />
      </div>

      {/* Rating and Notes */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Rating</h2>
        <RatingSelect 
          rating={formState.rating} 
          setRating={formSetters.setRating} 
        />
        <ResponsiveNotesArea
          notes={formState.notes}
          setNotes={formSetters.setNotes}
          picture={formState.picture}
          picturePreview={formState.picturePreview}
          setPicture={formSetters.setPicture}
          setPicturePreview={formSetters.setPicturePreview}
        />
      </div>

      {/* Price-to-Quality Ratio */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Price-to-Quality Ratio</h2>
        <PriceInput 
          price={formState.priceQualityRatio} 
          setPrice={formSetters.setPriceQualityRatio}
          hasChanged={formState.priceHasChanged}
          setHasChanged={formSetters.setPriceHasChanged}
        />
      </div>

      {/* Buying Location */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Buying Location</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country <span className="text-red-500">*</span>
            </label>
            <CountrySelect 
              country={formState.country} 
              setCountry={formSetters.setCountry} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop (optional)
            </label>
            <ShopSelect 
              shop={formState.shop} 
              setShop={formSetters.setShop}
              selectedCountry={formState.country}
            />
          </div>
        </div>
      </div>

      {/* Drinking Style */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Drinking Style</h2>
        <DrinkPreference
          preference={formState.drinkPreference}
          setPreference={formSetters.setDrinkPreference}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={formState.isSubmitting}
          className="px-4 py-2"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="brand"
          disabled={formState.isSubmitting}
          className="px-4 py-2"
        >
          {formState.isSubmitting ? "Updating..." : "Update"}
        </Button>
        
        {/* Delete Button with Confirmation */}
        <Button
          type="button"
          variant="outline"
          disabled={formState.isSubmitting}
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 border-destructive text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="z-[200]">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Test Record</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this milk test record?
                <br /><br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </form>
  );
};
