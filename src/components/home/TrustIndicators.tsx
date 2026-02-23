interface TrustIndicatorItem {
  value: number;
  label: string;
  colorClass: string;
  delayClass?: string;
}

interface TrustIndicatorsProps {
  items: TrustIndicatorItem[];
  formatNumber: (num: number) => string;
}

export const TrustIndicators = ({ items, formatNumber }: TrustIndicatorsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground animate-fade-in">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${item.colorClass}`}
          />
          <span>
            {formatNumber(item.value)} {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};
