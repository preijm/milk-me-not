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
    handleSubmit
  } = useMilkTestForm();
  const isFormValid = formState.productId && formState.rating > 0;
  return <form onSubmit={e => {
    e.preventDefault();
    if (isFormValid) {
      handleSubmit(e);
    }
  }} className="space-y-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 animate-fade-up border border-white/20">
      <ProductInformation brandId={formState.brandId} setBrandId={formSetters.setBrandId} productId={formState.productId} setProductId={formSetters.setProductId} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Rating</h2>
        <RatingSelect rating={formState.rating} setRating={formSetters.setRating} />
        <ResponsiveNotesArea notes={formState.notes} setNotes={formSetters.setNotes} picture={formState.picture} picturePreview={formState.picturePreview} setPicture={formSetters.setPicture} setPicturePreview={formSetters.setPicturePreview} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Price-to-Quality Ratio</h2>
        <PriceInput price={formState.price} setPrice={formSetters.setPrice} hasChanged={formState.priceHasChanged} setHasChanged={formSetters.setPriceHasChanged} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Buying Information</h2>
        <ShopSelect shop={formState.shop} setShop={formSetters.setShop} />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Drinking Style</h2>
        <DrinkPreference preference={formState.drinkPreference} setPreference={formSetters.setDrinkPreference} />
      </div>

      <Button type="submit" disabled={formState.isSubmitting || !isFormValid} className="w-full from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600 transition-all duration-300 shadow-md bg-[2144ff] bg-[#2144ff]">
        {formState.isSubmitting ? "Adding..." : "Add Result"}
      </Button>
    </form>;
};