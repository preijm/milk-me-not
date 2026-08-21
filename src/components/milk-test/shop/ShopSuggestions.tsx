import React, { useState, useRef, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteShopDialog } from "./DeleteShopDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { SUGGESTION_PANEL, SUGGESTION_ROW, SUGGESTION_ROW_MUTED, SUGGESTION_SCROLL } from "../suggestionStyles";

interface ShopSuggestionsProps {
  suggestions: { name: string; country_code: string | null }[];
  showAddNew: boolean;
  inputValue: string;
  onSelect: (shop: { name: string; country_code: string | null }) => void;
  onAddNew: () => void;
  isVisible: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export const ShopSuggestions = ({
  suggestions,
  showAddNew,
  inputValue,
  onSelect,
  onAddNew,
  isVisible,
  onEditingChange,
}: ShopSuggestionsProps) => {
  const { data: isAdmin } = useAdminCheck();
  const [editingShopName, setEditingShopName] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingShopName, setDeletingShopName] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingShopName && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingShopName]);

  // Always render the delete dialog, even when dropdown is hidden
  // This prevents the dialog from being unmounted by the blur timeout
  const deleteDialog = (
    <DeleteShopDialog
      open={!!deletingShopName}
      onOpenChange={(open) => {
        if (!open) {
          setDeletingShopName(null);
          onEditingChange?.(false);
        }
      }}
      shopName={deletingShopName}
      onSuccess={() => {
        setDeletingShopName(null);
        onEditingChange?.(false);
      }}
    />
  );

  if (!isVisible || (suggestions.length === 0 && !showAddNew)) {
    return deleteDialog;
  }

  const handleEditClick = (
    e: React.MouseEvent,
    shop: { name: string; country_code: string | null }
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingShopName(shop.name);
    setEditValue(shop.name);
    onEditingChange?.(true);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingShopName(null);
    setEditValue("");
    onEditingChange?.(false);
  };

  const handleSaveEdit = async (e: React.MouseEvent, originalName: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editValue.trim() || editValue.trim() === originalName) {
      setEditingShopName(null);
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("shops")
        .update({ name: editValue.trim() })
        .eq("name", originalName);

      if (error) throw error;

      toast({
        title: "Shop updated",
        description: "The shop has been renamed successfully.",
      });

      queryClient.invalidateQueries({ queryKey: ["shops"] });
      setEditingShopName(null);
      setEditValue("");
      onEditingChange?.(false);
    } catch (error) {
      console.error("Error updating shop:", error);
      toast({
        title: "Error",
        description: "Failed to update shop. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, shopName: string) => {
    e.preventDefault();
    e.stopPropagation();
    onEditingChange?.(true);
    setDeletingShopName(shopName);
  };

  const handleKeyDown = (e: React.KeyboardEvent, originalName: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(e as unknown as React.MouseEvent, originalName);
    } else if (e.key === "Escape") {
      setEditingShopName(null);
      setEditValue("");
      onEditingChange?.(false);
    }
  };

  return (
    <>
      <div className={cn(SUGGESTION_PANEL, SUGGESTION_SCROLL)}>
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={cn(SUGGESTION_ROW, "group justify-between")}
            onMouseDown={(e) => {
              if (editingShopName !== suggestion.name) {
                e.preventDefault();
                onSelect(suggestion);
              }
            }}
          >
            {editingShopName === suggestion.name ? (
              <>
                <div className="flex-1 min-w-0" onMouseDown={(e) => e.stopPropagation()}>
                  <Input
                    ref={editInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, suggestion.name)}
                    className="h-7 text-sm"
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex gap-1 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onMouseDown={(e) => handleCancelEdit(e)}
                    disabled={isUpdating}
                    title="Cancel"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-story-green-dark hover:text-story-green-dark"
                    onMouseDown={(e) => handleSaveEdit(e, suggestion.name)}
                    disabled={isUpdating || !editValue.trim()}
                    title="Save"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span>{suggestion.name}</span>
                {isAdmin && (
                  <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
                      className="h-6 w-6 text-error hover:text-error"
                      onMouseDown={(e) => handleDeleteClick(e, suggestion.name)}
                      title="Delete shop"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {showAddNew && !editingShopName && (
          <div
            className={SUGGESTION_ROW_MUTED}
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

      {deleteDialog}
    </>
  );
};
