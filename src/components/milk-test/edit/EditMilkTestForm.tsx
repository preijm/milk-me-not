
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RatingSelect } from "../RatingSelect";
import { ResponsiveNotesArea } from "../ResponsiveNotesArea";
import { PriceInput } from "../PriceInput";
import { ShopSelect } from "../ShopSelect";
import { DrinkPreference } from "../DrinkPreference";
import { ProductInfo } from "./ProductInfo";

interface EditMilkTestFormProps {
  formState: {
    rating: number;
    notes: string;
    shop: string;
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
}

export const EditMilkTestForm = ({
  formState,
  formSetters,
  brand,
  productName,
  onSubmit,
  onCancel,
}: EditMilkTestFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
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
        <ShopSelect
          shop={formState.shop}
          setShop={formSetters.setShop}
        />
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
      </div>
    </form>
  );
};
