export type ShopCategory = 'Protein' | 'Carbs & Grains' | 'Dairy & Fats' | 'Veg & Fruit' | 'Flavour & Basics'

export interface ShopItem {
  id: string
  name: string
  category: ShopCategory
  qty: string      // e.g. "2kg", "x18", "4 tins"
  price: number    // GBP
  note?: string    // optional tip
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── PROTEIN ──────────────────────────────────────────────────────────────
  { id: 'p1',  category: 'Protein', name: 'Chicken thighs (boneless)',  qty: '2kg',      price: 5.50, note: 'Cheapest protein per gram. Bulk cook Sunday.' },
  { id: 'p2',  category: 'Protein', name: 'Chicken breast',             qty: '1kg',      price: 4.00 },
  { id: 'p3',  category: 'Protein', name: 'Eggs',                       qty: 'x18',      price: 3.20, note: 'Go through these fast — buy 2 boxes if needed.' },
  { id: 'p4',  category: 'Protein', name: 'Tinned tuna in water',       qty: 'x8 tins',  price: 4.00, note: 'Cheapest lean protein available.' },
  { id: 'p5',  category: 'Protein', name: 'Tinned sardines',            qty: 'x4 tins',  price: 2.40, note: 'High protein + omega-3. Underrated.' },
  { id: 'p6',  category: 'Protein', name: 'Beef mince (5% fat)',        qty: '1kg',      price: 4.50 },
  { id: 'p7',  category: 'Protein', name: 'Turkey mince',               qty: '500g',     price: 2.50 },
  { id: 'p8',  category: 'Protein', name: 'Salmon fillets',             qty: '4 pack',   price: 5.00, note: 'Omega-3 for recovery. Bake or pan fry.' },
  { id: 'p9',  category: 'Protein', name: 'Smoked salmon',              qty: '200g',     price: 3.00 },
  { id: 'p10', category: 'Protein', name: 'Sirloin steak',              qty: '400g',     price: 5.50, note: 'One steak meal per week. Worth it.' },
  { id: 'p11', category: 'Protein', name: 'Lamb chops',                 qty: '500g',     price: 4.50 },
  { id: 'p12', category: 'Protein', name: 'Turkey breast slices',       qty: '400g',     price: 2.80, note: 'No-cook protein. Wraps + snacks.' },
  { id: 'p13', category: 'Protein', name: 'Edamame (frozen)',           qty: '500g',     price: 1.50, note: 'Complete protein. Microwave in 5 min.' },
  { id: 'p14', category: 'Protein', name: 'Greek yoghurt (full fat)',   qty: '1kg',      price: 1.89 },
  { id: 'p15', category: 'Protein', name: 'Cottage cheese',             qty: '500g',     price: 1.50, note: 'High casein — good pre-bed.' },

  // ── CARBS & GRAINS ────────────────────────────────────────────────────────
  { id: 'c1', category: 'Carbs & Grains', name: 'White rice',           qty: '2kg',      price: 1.89, note: 'Bulk cook 3x per week.' },
  { id: 'c2', category: 'Carbs & Grains', name: 'Oats (rolled)',        qty: '1kg',      price: 1.10 },
  { id: 'c3', category: 'Carbs & Grains', name: 'Whole grain pasta',    qty: '1kg',      price: 1.20 },
  { id: 'c4', category: 'Carbs & Grains', name: 'Sweet potatoes',       qty: '1.5kg',    price: 1.50 },
  { id: 'c5', category: 'Carbs & Grains', name: 'Basmati rice',         qty: '1kg',      price: 1.50 },
  { id: 'c6', category: 'Carbs & Grains', name: 'Whole wheat wraps',    qty: 'x8',       price: 1.20 },
  { id: 'c7', category: 'Carbs & Grains', name: 'Sourdough bread',      qty: '400g',     price: 1.50 },
  { id: 'c8', category: 'Carbs & Grains', name: 'Rice cakes',           qty: 'x10',      price: 0.89 },
  { id: 'c9', category: 'Carbs & Grains', name: 'Quinoa',               qty: '500g',     price: 2.00, note: 'Complete protein + carbs.' },
  { id: 'c10',category: 'Carbs & Grains', name: 'Couscous',             qty: '500g',     price: 1.00, note: 'Ready in 5 min. Pairs with lamb.' },
  { id: 'c11',category: 'Carbs & Grains', name: 'Rice noodles',         qty: '500g',     price: 1.20 },
  { id: 'c12',category: 'Carbs & Grains', name: 'Whole grain crackers', qty: 'x2 packs', price: 1.20 },
  { id: 'c13',category: 'Carbs & Grains', name: 'Granola (low sugar)',   qty: '500g',     price: 1.80, note: 'For Greek yoghurt breakfast bowl.' },
  { id: 'c14',category: 'Carbs & Grains', name: 'White / baking potatoes', qty: '1.5kg', price: 1.20, note: 'For ribeye + baked potato dinner.' },
  { id: 'c15',category: 'Carbs & Grains', name: 'Brown rice',            qty: '1kg',      price: 1.50, note: 'For salmon + edamame dinner.' },

  // ── DAIRY & FATS ─────────────────────────────────────────────────────────
  { id: 'df1', category: 'Dairy & Fats', name: 'Milk (semi-skimmed)',   qty: '2L',       price: 1.45 },
  { id: 'df2', category: 'Dairy & Fats', name: 'Cheddar cheese',        qty: '400g',     price: 2.30 },
  { id: 'df3', category: 'Dairy & Fats', name: 'Peanut butter (natural)',qty: '1kg',     price: 3.49, note: 'Natural only — no added sugar.' },
  { id: 'df4', category: 'Dairy & Fats', name: 'Mixed nuts',            qty: '400g',     price: 2.99 },
  { id: 'df5', category: 'Dairy & Fats', name: 'Olive oil',             qty: '500ml',    price: 2.99 },
  { id: 'df6', category: 'Dairy & Fats', name: 'Avocados',              qty: 'x4',       price: 2.00 },
  { id: 'df7', category: 'Dairy & Fats', name: 'Butter',                qty: '250g',     price: 1.75 },

  // ── VEG & FRUIT ───────────────────────────────────────────────────────────
  { id: 'v1', category: 'Veg & Fruit', name: 'Broccoli',                qty: 'x2 heads', price: 1.30 },
  { id: 'v2', category: 'Veg & Fruit', name: 'Spinach',                 qty: '200g bag', price: 0.89 },
  { id: 'v3', category: 'Veg & Fruit', name: 'Frozen mixed veg',        qty: '1kg bag',  price: 0.89, note: 'Easiest way to hit your veg intake.' },
  { id: 'v4', category: 'Veg & Fruit', name: 'Bananas',                 qty: 'x6',       price: 0.68 },
  { id: 'v5', category: 'Veg & Fruit', name: 'Apples',                  qty: 'x6',       price: 1.10 },
  { id: 'v6', category: 'Veg & Fruit', name: 'Mixed berries (frozen)',  qty: '500g',     price: 1.50, note: 'Antioxidants. Good in oats/yoghurt.' },
  { id: 'v7', category: 'Veg & Fruit', name: 'Tinned tomatoes',         qty: 'x4 tins',  price: 1.40 },
  { id: 'v8', category: 'Veg & Fruit', name: 'Asparagus',               qty: '250g',     price: 1.20 },
  { id: 'v9', category: 'Veg & Fruit', name: 'Cherry tomatoes',         qty: '300g',     price: 1.00 },
  { id: 'v10',category: 'Veg & Fruit', name: 'Lemons',                  qty: 'x4',       price: 0.89 },
  { id: 'v11',category: 'Veg & Fruit', name: 'Pineapple chunks (tinned)',qty: 'x2 tins', price: 1.30 },
  { id: 'v12',category: 'Veg & Fruit', name: 'Frozen peas',             qty: '1kg bag',  price: 0.89, note: 'For chicken thighs + basmati dinner.' },

  // ── FLAVOUR & BASICS ──────────────────────────────────────────────────────
  { id: 'f1', category: 'Flavour & Basics', name: 'Garlic (bulb)',      qty: 'x3',       price: 0.79 },
  { id: 'f2', category: 'Flavour & Basics', name: 'Soy sauce',          qty: '150ml',    price: 0.65 },
  { id: 'f3', category: 'Flavour & Basics', name: 'Mixed herbs / spices',qty: '2–3 jars',price: 1.50, note: 'Paprika, cumin, garlic powder at minimum.' },
  { id: 'f4', category: 'Flavour & Basics', name: 'Stock cubes',        qty: 'x10',      price: 0.65 },
  { id: 'f5', category: 'Flavour & Basics', name: 'Honey',              qty: '340g jar', price: 2.00 },
  { id: 'f6', category: 'Flavour & Basics', name: 'Oyster sauce',       qty: '150ml',    price: 1.10 },
  { id: 'f7', category: 'Flavour & Basics', name: 'Sesame oil',         qty: '150ml',    price: 1.50 },
  { id: 'f8', category: 'Flavour & Basics', name: 'Fresh ginger',       qty: 'x2 pieces',price: 0.60, note: 'For beef stir fry. Freeze what you don\'t use.' },
]

export const SHOP_CATEGORIES: ShopCategory[] = [
  'Protein', 'Carbs & Grains', 'Dairy & Fats', 'Veg & Fruit', 'Flavour & Basics',
]

export const SHOP_TARGET_LOW  = 50
export const SHOP_TARGET_HIGH = 70
