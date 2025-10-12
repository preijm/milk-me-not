export type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

export type AggregatedResult = {
  brand_id: string;
  brand_name: string;
  product_id: string;
  product_name: string;
  property_names?: string[] | null;
  is_barista?: boolean;
  flavor_names?: string[] | null;
  avg_rating: number;
  count: number;
  most_recent_date: string;
};

export interface FilterOptions {
  barista: boolean;
  properties: string[];
  flavors: string[];
  myResultsOnly: boolean;
}

export interface BaseResultsProps {
  results: AggregatedResult[];
  sortConfig: SortConfig;
  handleSort: (column: string) => void;
  onProductClick: (productId: string) => void;
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
}