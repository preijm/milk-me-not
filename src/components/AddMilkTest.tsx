
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShopSelect } from "./milk-test/ShopSelect";
import { IngredientsSelect } from "./milk-test/IngredientsSelect";
import { RatingSelect } from "./milk-test/RatingSelect";
import { ProductInformation } from "./milk-test/ProductInformation";
import { ProductOptions } from "./milk-test/ProductOptions";
import { DrinkPreference } from "./milk-test/DrinkPreference";
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
        productName={formState.productName}
        setProductName={formSetters.setProductName}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Rating</h2>
        <RatingSelect 
          rating={formState.rating} 
          setRating={formSetters.setRating} 
        />
        <Textarea
          placeholder="Tasting notes..."
          value={formState.notes}
          onChange={(e) => formSetters.setNotes(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Buying Location</h2>
        <ShopSelect
          shop={formState.shop}
          setShop={formSetters.setShop}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Product Type</h2>
        <ProductOptions
          selectedTypes={formState.selectedProductTypes}
          setSelectedTypes={formSetters.setSelectedProductTypes}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Drinking Style</h2>
        <DrinkPreference
          preference={formState.drinkPreference}
          setPreference={formSetters.setDrinkPreference}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
        <IngredientsSelect
          ingredients={formState.ingredients}
          setIngredients={formSetters.setIngredients}
          allIngredients={formState.allIngredients}
          setAllIngredients={formSetters.setAllIngredients}
          newIngredient={formState.newIngredient}
          setNewIngredient={formSetters.setNewIngredient}
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
