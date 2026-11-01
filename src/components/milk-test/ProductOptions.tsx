
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductOptionsProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  /** Only admins may add properties — RLS on `properties` enforces the same. */
  canAdd?: boolean;
}

/** `High Protein` → `high_protein`, the shape every existing key has. */
const propertyKey = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

export const ProductOptions = ({
  selectedTypes,
  setSelectedTypes,
  canAdd = false,
}: ProductOptionsProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: productProperties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('ordering', { ascending: true });

      return data || [];
    },
  });

  const handleTypeToggle = (typeKey: string) => {
    if (selectedTypes.includes(typeKey)) {
      setSelectedTypes(selectedTypes.filter(t => t !== typeKey));
    } else {
      setSelectedTypes([...selectedTypes, typeKey]);
    }
  };

  const cancel = () => {
    setAdding(false);
    setNewName("");
  };

  const handleAdd = async () => {
    const name = newName.trim();
    const key = propertyKey(name);
    if (!key) return;

    setSaving(true);
    const ordering = Math.max(0, ...productProperties.map(p => p.ordering)) + 1;
    const { error } = await supabase.from('properties').insert({ name, key, ordering });
    setSaving(false);

    if (error) {
      toast({
        title: "Could not add property",
        // 23505 is a unique violation: the name or key is already on the board.
        description: error.code === "23505" ? `"${name}" already exists.` : error.message,
        variant: "destructive",
      });
      return;
    }

    // Every list of properties (picker, results filter, badges) shares this key.
    await queryClient.invalidateQueries({ queryKey: ['properties'] });
    setSelectedTypes([...selectedTypes, key]);
    cancel();
  };

  return (
    <div className="flex flex-wrap gap-3.5">
      {productProperties.map((property) => (
        <Badge
          key={property.key}
          variant="category"
          className={`cursor-pointer transition-all h-7 flex items-center ${
            selectedTypes.includes(property.key)
              ? 'bg-badge-property text-badge-property-foreground border-badge-property shadow-md'
              : ''
          }`}
          onClick={() => handleTypeToggle(property.key)}
        >
          {property.name}
        </Badge>
      ))}

      {canAdd && !adding && (
        <Badge
          variant="category"
          className="cursor-pointer h-7 flex items-center px-2.5"
          onClick={() => setAdding(true)}
          role="button"
          aria-label="Add new property"
        >
          <Plus size={16} />
        </Badge>
      )}

      {canAdd && adding && (
        <div className="flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Property name"
            className="h-7 w-40 text-sm"
            autoFocus
            disabled={saving}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              } else if (e.key === 'Escape') {
                cancel();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={cancel}
            disabled={saving}
            aria-label="Cancel"
          >
            <X size={14} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="brand"
            className="h-7 w-7 p-0"
            onClick={handleAdd}
            disabled={saving || !propertyKey(newName)}
            aria-label="Add property"
          >
            <Check size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};
