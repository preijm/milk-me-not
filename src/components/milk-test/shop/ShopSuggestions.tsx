import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { EditShopDialog } from "./EditShopDialog";
import { DeleteShopDialog } from "./DeleteShopDialog";

interface ShopSuggestionsProps {
  suggestions: { name: string; country_code: string | null }[];
  showAddNew: boolean;
  inputValue: string;
  onSelect: (shop: { name: string; country_code: string | null }) => void;
  onAddNew: () => void;
  isVisible: boolean;
}

export const ShopSuggestions = ({
  suggestions,
  showAddNew,
  inputValue,
  onSelect,
  onAddNew,
  isVisible,
}: ShopSuggestionsProps) => {
  const { data: isAdmin } = useAdminCheck();
  const [editingShop, setEditingShop] = useState<{
    name: string;
    country_code: string | null;
  } | null>(null);
  const [deletingShopName, setDeletingShopName] = useState<string | null>(null);

  if (!isVisible || (suggestions.length === 0 && !showAddNew)) {
    return null;
  }

  const handleEditClick = (
    e: React.MouseEvent,
    shop: { name: string; country_code: string | null }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingShop(shop);
  };

  const handleDeleteClick = (e: React.MouseEvent, shopName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingShopName(shopName);
  };

  return (
    <>
      <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="px-4 py-2 cursor-pointer hover:bg-muted flex items-center justify-between group"
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(suggestion);
            }}
          >
            <span>{suggestion.name}</span>
            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onMouseDown={(e) => handleEditClick(e, suggestion)}
                  title="Edit shop"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onMouseDown={(e) => handleDeleteClick(e, suggestion.name)}
                  title="Delete shop"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
        {showAddNew && (
          <div
            className="px-4 py-2 cursor-pointer hover:bg-muted flex items-center text-muted-foreground"
            onMouseDown={(e) => {
              e.preventDefault();
              onAddNew();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add "{inputValue.trim()}"
          </div>
        )}
      </div>

      <EditShopDialog
        open={!!editingShop}
        onOpenChange={(open) => !open && setEditingShop(null)}
        shop={editingShop}
        onSuccess={() => setEditingShop(null)}
      />

      <DeleteShopDialog
        open={!!deletingShopName}
        onOpenChange={(open) => !open && setDeletingShopName(null)}
        shopName={deletingShopName}
        onSuccess={() => setDeletingShopName(null)}
      />
    </>
  );
};
