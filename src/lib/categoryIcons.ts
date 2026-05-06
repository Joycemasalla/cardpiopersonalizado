import {
  Pizza, Beef, Coffee, IceCream, Salad, Wine, Sandwich, Cake, Soup, Cookie,
  Beer, CupSoda, Croissant, Drumstick, Egg, Fish, Apple, Carrot, Grape,
  Cherry, Citrus, Wheat, Milk, Utensils, type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  pizza: Pizza,
  beef: Beef,
  coffee: Coffee,
  "ice-cream": IceCream,
  salad: Salad,
  wine: Wine,
  sandwich: Sandwich,
  cake: Cake,
  soup: Soup,
  cookie: Cookie,
  beer: Beer,
  "cup-soda": CupSoda,
  croissant: Croissant,
  drumstick: Drumstick,
  egg: Egg,
  fish: Fish,
  apple: Apple,
  carrot: Carrot,
  grape: Grape,
  cherry: Cherry,
  citrus: Citrus,
  wheat: Wheat,
  milk: Milk,
  utensils: Utensils,
};

export const CATEGORY_ICON_KEYS = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(key?: string | null): LucideIcon | null {
  if (!key) return null;
  return CATEGORY_ICONS[key] ?? null;
}