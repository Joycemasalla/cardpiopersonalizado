import { CATEGORY_ICONS, CATEGORY_ICON_KEYS, getCategoryIcon } from "@/lib/categoryIcons";
import { Check, X } from "lucide-react";

interface IconPickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 p-2 bg-secondary border border-border rounded-md max-h-40 overflow-y-auto">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
            !value ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
          }`}
          title="Sem ícone"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        {CATEGORY_ICON_KEYS.map((key) => {
          const Icon = CATEGORY_ICONS[key];
          const active = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors relative ${
                active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              }`}
              title={key}
            >
              <Icon className="h-4 w-4" />
              {active && (
                <Check className="absolute -top-1 -right-1 h-3 w-3 bg-primary text-primary-foreground rounded-full p-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};