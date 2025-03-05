
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShopSelect } from "./milk-test/ShopSelect";
import { RatingSelect } from "./milk-test/RatingSelect";
import { ProductInformation } from "./milk-test/ProductInformation";
import { DrinkPreference } from "./milk-test/DrinkPreference";
import { PriceInput } from "./milk-test/PriceInput";
import { PictureCapture } from "./milk-test/PictureCapture";
import { useMilkTestForm } from "@/hooks/useMilkTestForm";

export const AddMilkTest = () => {
  const {
    formState,
    formSetters,
    handleSubmit,
  } = useMilkTestForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg shadow-md p-6 animate-fade-up">
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
        <div className="flex gap-4 items-stretch">
          <Textarea
            placeholder="Tasting notes..."
            value={formState.notes}
            onChange={(e) => formSetters.setNotes(e.target.value)}
            className="flex-1 min-h-[120px]"
          />
          <div className="w-[120px]">
            <PictureCapture
              picture={formState.picture}
              picturePreview={formState.picturePreview}
              setPicture={formSetters.setPicture}
              setPicturePreview={formSetters.setPicturePreview}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Buying Information</h2>
        <ShopSelect
          shop={formState.shop}
          setShop={formSetters.setShop}
        />
        <PriceInput
          price={formState.price}
          setPrice={formSetters.setPrice}
        />
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
        disabled={formState.isSubmitting}
      >
        {formState.isSubmitting ? "Adding..." : "Add Result"}
      </Button>
    </form>
  );
};
