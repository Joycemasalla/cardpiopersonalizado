import type { Category, MenuProduct } from "@/types/store";

export const DEMO_CATEGORIES: Pick<Category, "id" | "name" | "image_url" | "sort_order" | "is_active" | "created_at">[] = [
  { id: "demo-cat-burgers", name: "Hambúrgueres (Demo)", image_url: null, sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: "demo-cat-pizzas", name: "Pizzas (Demo)", image_url: null, sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: "demo-cat-drinks", name: "Bebidas (Demo)", image_url: null, sort_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: "demo-cat-desserts", name: "Sobremesas (Demo)", image_url: null, sort_order: 4, is_active: true, created_at: new Date().toISOString() },
];

export const DEMO_PRODUCTS: MenuProduct[] = [
  {
    id: "demo-prod-1",
    name: "Burger Clássico (Demo)",
    description: "Pão brioche, blend 180g, queijo cheddar, alface, tomate e molho da casa.",
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    category_id: "demo-cat-burgers",
    category_name: "Hambúrgueres (Demo)",
    sizes: [
      { id: "demo-prod-1-s", name: "Simples", price: 28.9 },
      { id: "demo-prod-1-d", name: "Duplo", price: 38.9 },
    ],
  },
  {
    id: "demo-prod-2",
    name: "Burger Bacon (Demo)",
    description: "Blend 180g, bacon crocante, queijo prato e cebola caramelizada.",
    image_url: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600&q=80",
    category_id: "demo-cat-burgers",
    category_name: "Hambúrgueres (Demo)",
    sizes: [{ id: "demo-prod-2-u", name: "Único", price: 34.9 }],
  },
  {
    id: "demo-prod-3",
    name: "Pizza Margherita (Demo)",
    description: "Molho de tomate fresco, mussarela de búfala, manjericão e azeite.",
    image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80",
    category_id: "demo-cat-pizzas",
    category_name: "Pizzas (Demo)",
    sizes: [
      { id: "demo-prod-3-m", name: "Média", price: 49.9 },
      { id: "demo-prod-3-g", name: "Grande", price: 64.9 },
    ],
  },
  {
    id: "demo-prod-4",
    name: "Pizza Pepperoni (Demo)",
    description: "Molho de tomate, mussarela e fatias generosas de pepperoni.",
    image_url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80",
    category_id: "demo-cat-pizzas",
    category_name: "Pizzas (Demo)",
    sizes: [
      { id: "demo-prod-4-m", name: "Média", price: 54.9 },
      { id: "demo-prod-4-g", name: "Grande", price: 69.9 },
    ],
  },
  {
    id: "demo-prod-5",
    name: "Refrigerante Lata (Demo)",
    description: "Lata 350ml gelada.",
    image_url: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&q=80",
    category_id: "demo-cat-drinks",
    category_name: "Bebidas (Demo)",
    sizes: [{ id: "demo-prod-5-u", name: "350ml", price: 6.9 }],
  },
  {
    id: "demo-prod-6",
    name: "Suco Natural (Demo)",
    description: "Suco da fruta na hora, copo 400ml.",
    image_url: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&q=80",
    category_id: "demo-cat-drinks",
    category_name: "Bebidas (Demo)",
    sizes: [{ id: "demo-prod-6-u", name: "400ml", price: 9.9 }],
  },
  {
    id: "demo-prod-7",
    name: "Brownie com Sorvete (Demo)",
    description: "Brownie quente de chocolate com bola de sorvete de creme.",
    image_url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&q=80",
    category_id: "demo-cat-desserts",
    category_name: "Sobremesas (Demo)",
    sizes: [{ id: "demo-prod-7-u", name: "Único", price: 18.9 }],
  },
  {
    id: "demo-prod-8",
    name: "Petit Gateau (Demo)",
    description: "Bolinho quente de chocolate com recheio cremoso e sorvete.",
    image_url: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&q=80",
    category_id: "demo-cat-desserts",
    category_name: "Sobremesas (Demo)",
    sizes: [{ id: "demo-prod-8-u", name: "Único", price: 22.9 }],
  },
];