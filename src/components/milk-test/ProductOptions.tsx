
import { Checkbox } from "@/components/ui/checkbox";

interface ProductOptionsProps {
  isBarista: boolean;
  setIsBarista: (checked: boolean) => void;
  isUnsweetened: boolean;
  setIsUnsweetened: (checked: boolean) => void;
  isSpecialEdition: boolean;
  setIsSpecialEdition: (checked: boolean) => void;
  isNoSugar: boolean;
  setIsNoSugar: (checked: boolean) => void;
}

export const ProductOptions = ({
  isBarista,
  setIsBarista,
  isUnsweetened,
  setIsUnsweetened,
  isSpecialEdition,
  setIsSpecialEdition,
  isNoSugar,
  setIsNoSugar,
}: ProductOptionsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="barista"
            checked={isBarista}
            onCheckedChange={(checked) => setIsBarista(checked as boolean)}
          />
          <label
            htmlFor="barista"
            className="text-sm leading-none text-gray-600"
          >
            Barista Version
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="unsweetened"
            checked={isUnsweetened}
            onCheckedChange={(checked) => setIsUnsweetened(checked as boolean)}
          />
          <label
            htmlFor="unsweetened"
            className="text-sm leading-none text-gray-600"
          >
            Unsweetened
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="special"
            checked={isSpecialEdition}
            onCheckedChange={(checked) => setIsSpecialEdition(checked as boolean)}
          />
          <label
            htmlFor="special"
            className="text-sm leading-none text-gray-600"
          >
            Special Edition
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="no-sugar"
            checked={isNoSugar}
            onCheckedChange={(checked) => setIsNoSugar(checked as boolean)}
          />
          <label
            htmlFor="no-sugar"
            className="text-sm leading-none text-gray-600"
          >
            No Sugar
          </label>
        </div>
      </div>
    </div>
  );
};
