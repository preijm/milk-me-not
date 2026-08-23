import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { humanizeLabel } from "@/lib/labels";
import type { FilterOptions } from "@/hooks/useResultsState";

type ResultsFilterPanelProps = {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  showMyResults: boolean;
};

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border-[1.5px] px-3.5 py-2 text-[0.8125rem] font-bold leading-none transition-colors",
      active
        ? "border-story-green bg-story-green text-white"
        : "border-story-ink/15 bg-transparent text-story-ink-2 hover:bg-story-ink/5",
    )}
  >
    {children}
  </button>
);

/**
 * The filter controls, shared verbatim between the desktop popover and the
 * mobile sheet. Raw property/flavour keys always run through `humanizeLabel`
 * before a shopper sees them.
 */
export const ResultsFilterPanel = ({ filters, onFiltersChange, showMyResults }: ResultsFilterPanelProps) => {
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data } = await supabase.from("properties").select("*").order("ordering", { ascending: true });
      return data || [];
    },
  });

  const { data: flavors = [] } = useQuery({
    queryKey: ["flavors"],
    queryFn: async () => {
      const { data } = await supabase.from("flavors").select("*").order("ordering", { ascending: true });
      return data || [];
    },
  });

  const toggleProperty = (key: string) => {
    const has = filters.properties.includes(key);
    onFiltersChange({
      ...filters,
      properties: has ? filters.properties.filter((p) => p !== key) : [...filters.properties, key],
    });
  };

  const toggleFlavor = (key: string) => {
    const has = filters.flavors.includes(key);
    onFiltersChange({
      ...filters,
      flavors: has ? filters.flavors.filter((f) => f !== key) : [...filters.flavors, key],
    });
  };

  const hasActive =
    filters.barista || filters.myResultsOnly || filters.properties.length > 0 || filters.flavors.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="story-kicker text-story-muted-2">Show me only</p>
        {hasActive && (
          <button
            type="button"
            onClick={() => onFiltersChange({ barista: false, properties: [], flavors: [], myResultsOnly: false })}
            className="text-[0.75rem] font-bold text-story-green-dark hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {showMyResults && (
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.myResultsOnly} onClick={() => onFiltersChange({ ...filters, myResultsOnly: !filters.myResultsOnly })}>
            My ratings only
          </Chip>
        </div>
      )}

      <div>
        <p className="mb-2 text-[0.8125rem] font-bold text-story-ink-2">Type</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={filters.barista} onClick={() => onFiltersChange({ ...filters, barista: !filters.barista })}>
            Barista blend
          </Chip>
        </div>
      </div>

      {properties.length > 0 && (
        <div>
          <p className="mb-2 text-[0.8125rem] font-bold text-story-ink-2">Properties</p>
          <div className="flex flex-wrap gap-2">
            {properties.map((property) => (
              <Chip
                key={property.id}
                active={filters.properties.includes(property.key)}
                onClick={() => toggleProperty(property.key)}
              >
                {humanizeLabel(property.name) || humanizeLabel(property.key)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {flavors.length > 0 && (
        <div>
          <p className="mb-2 text-[0.8125rem] font-bold text-story-ink-2">Flavours</p>
          <div className="flex flex-wrap gap-2">
            {flavors.map((flavor) => (
              <Chip key={flavor.id} active={filters.flavors.includes(flavor.key)} onClick={() => toggleFlavor(flavor.key)}>
                {humanizeLabel(flavor.name) || humanizeLabel(flavor.key)}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
