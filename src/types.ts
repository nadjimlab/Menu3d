export interface Allergen {
  id: string;
  name: string;
  nameEn: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  nameEn: string;
  extraPrice: number;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  titleEn: string;
  required: boolean;
  maxSelect?: number;
  options: CustomizationOption[];
}

export interface ProductPalette {
  primary: string;       // main accent color
  secondary: string;     // deep ambient shadow
  ambientGlow: string;   // glowing light center
  accent: string;        // highlight tone
  textColor: string;     // light tint for text highlights
  gradient: string;      // linear / radial dynamic CSS background string
}

export interface Product {
  id: string;
  name: string;
  nameEn: string;
  shortDesc: string;
  fullDesc: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  badge?: string;
  calories: number;
  prepTime: string;
  rating: number;
  reviewsCount: number;
  palette: ProductPalette;
  ingredients: string[];
  allergens: Allergen[];
  nutrition: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    sugar?: string;
  };
  customizationGroups: CustomizationGroup[];
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string;
  iconName: string;
  accentColor: string;
  itemCount?: number;
}

export interface SelectedOption {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  extraPrice: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  selectedOptions: SelectedOption[];
  specialNotes?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface StoreInfo {
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  isOpen: boolean;
  openStatusText: string;
  prepTimeEstimate: string;
  tableNumber: string;
  diningMode: 'dine-in' | 'takeaway';
  location: string;
  rating: number;
  totalProducts: number;
}

export type PaymentMethod = 'cash' | 'baridimob' | 'card' | 'counter';
export type OrderStatus = 'received' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface OrderDetails {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  tableNumber: string;
  diningMode: 'dine-in' | 'takeaway';
  customerName?: string;
  customerPhone?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: Date;
  confirmedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  status: OrderStatus;
  estimatedMinutes: number;
}
