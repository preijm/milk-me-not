
import React from "react";
import { Button } from "@/components/ui/button";
import { ShopSelect } from "./milk-test/ShopSelect";
import { RatingSelect } from "./milk-test/RatingSelect";
import { ProductInformation } from "./milk-test/ProductInformation";
import { DrinkPreference } from "./milk-test/DrinkPreference";
import { PriceInput } from "./milk-test/PriceInput";
import { ResponsiveNotesArea } from "./milk-test/ResponsiveNotesArea";
import { useMilkTestForm } from "@/hooks/useMilkTestForm";

export const AddMilkTest = () => {
  const {
    formState,
    formSetters,
    handleSubmit,
  } = useMilkTestForm();

  // Form validation for the main submit button
  const isFormValid = formState.productId && formState.rating > 0;

  return (
    <form 
      onSubmit={(e) => {
        // Prevent default here to ensure no unwanted submissions occur
        e.preventDefault();
        // Only submit if the form is valid
        if (isFormValid) {
          handleSubmit(e);
        }
      }} 
      className="space-y-8 bg-white rounded-lg shadow-md p-6 animate-fade-up"
    >
      <ProductInformation
        brandId={formState.brandId}
        setBrandId={formSetters.setBrandId}
        productId={formState.productId}
        setProductId={formSetters.setProductId}
      />

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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Buying Information</h2>
        <ShopSelect
          shop={formState.shop}
          setShop={formSetters.setShop}
        />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Price-to-Quality Ratio</h3>
          <PriceInput
            price={formState.price}
            setPrice={formSetters.setPrice}
            hasChanged={formState.priceHasChanged}
            setHasChanged={formSetters.setPriceHasChanged}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Drinking Style</h2>
        <DrinkPreference
          preference={formState.drinkPreference}
          setPreference={formSetters.setDrinkPreference}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-cream-300 hover:bg-cream-200 text-milk-500"
        disabled={formState.isSubmitting || !isFormValid}
      >
        {formState.isSubmitting ? "Adding..." : "Add Result"}
      </Button>
    </form>
  );
};
