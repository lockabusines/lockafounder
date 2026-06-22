export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'

export interface Meal {
  id: string
  name: string
  category: MealCategory
  calories: number
  protein: number  // grams
  carbs: number    // grams
  fat: number      // grams
  prepMins: number
  notes: string    // optional tip e.g. "cook in bulk"
}

// Daily targets — Fight Club physique: lean, defined, not bulky
export const TARGETS = { calories: 3000, protein: 200, carbs: 250, fat: 80 }

// ─── MEAL DATABASE ────────────────────────────────────────────────────────────
// Add your own meals below — just copy a block and change the values.
// ID must be unique. prepMins: rough hands-on time in minutes.
// ─────────────────────────────────────────────────────────────────────────────

export const MEALS: Meal[] = [
  // ── BREAKFAST ──────────────────────────────────────────────────────────────
  {
    id: 'b1', category: 'Breakfast',
    name: 'Scrambled Eggs + Oats + Berries',
    calories: 520, protein: 38, carbs: 54, fat: 16, prepMins: 10,
    notes: 'Use 4 whole eggs. Cook oats in milk for extra protein.',
  },
  {
    id: 'b2', category: 'Breakfast',
    name: 'Greek Yoghurt + Banana + Granola',
    calories: 480, protein: 32, carbs: 66, fat: 12, prepMins: 3,
    notes: 'Full-fat Greek yoghurt. Low-sugar granola.',
  },
  {
    id: 'b3', category: 'Breakfast',
    name: 'Chicken Omelette (3 eggs + chicken)',
    calories: 450, protein: 54, carbs: 4, fat: 22, prepMins: 12,
    notes: 'Use leftover chicken. Add spinach if you have it.',
  },
  {
    id: 'b4', category: 'Breakfast',
    name: 'Overnight Oats + Peanut Butter',
    calories: 560, protein: 34, carbs: 62, fat: 18, prepMins: 5,
    notes: 'Prep the night before — zero morning effort.',
  },
  {
    id: 'b5', category: 'Breakfast',
    name: 'Smoked Salmon + Eggs + Sourdough',
    calories: 490, protein: 42, carbs: 28, fat: 20, prepMins: 8,
    notes: '2 poached or fried eggs. 2 slices sourdough.',
  },
  {
    id: 'b6', category: 'Breakfast',
    name: 'Turkey + Egg White Breakfast Wrap',
    calories: 430, protein: 46, carbs: 38, fat: 10, prepMins: 10,
    notes: '4 egg whites + 100g turkey. Whole wheat wrap.',
  },
  {
    id: 'b7', category: 'Breakfast',
    name: 'Cottage Cheese + Rice Cakes + Fruit',
    calories: 380, protein: 36, carbs: 40, fat: 6, prepMins: 2,
    notes: 'Zero cook. High protein, low fat — good cut day option.',
  },

  // ── LUNCH ──────────────────────────────────────────────────────────────────
  {
    id: 'l1', category: 'Lunch',
    name: 'Chicken Breast + White Rice + Broccoli',
    calories: 620, protein: 55, carbs: 72, fat: 10, prepMins: 20,
    notes: 'The classic. Cook rice and chicken in bulk Sunday.',
  },
  {
    id: 'l2', category: 'Lunch',
    name: 'Tuna Pasta (whole grain)',
    calories: 580, protein: 48, carbs: 66, fat: 12, prepMins: 12,
    notes: '2 tins tuna. Olive oil, lemon, capers if you want.',
  },
  {
    id: 'l3', category: 'Lunch',
    name: 'Turkey Burger + Sweet Potato Fries',
    calories: 650, protein: 52, carbs: 68, fat: 16, prepMins: 25,
    notes: 'Make patties from mince. Bake fries — no oil needed.',
  },
  {
    id: 'l4', category: 'Lunch',
    name: 'Steak + Rice + Side Salad',
    calories: 700, protein: 58, carbs: 62, fat: 22, prepMins: 15,
    notes: 'Sirloin or rump. 180g cooked rice. Keep it simple.',
  },
  {
    id: 'l5', category: 'Lunch',
    name: 'Salmon Fillet + Quinoa + Roasted Veg',
    calories: 580, protein: 50, carbs: 56, fat: 18, prepMins: 20,
    notes: 'Bake salmon 12 min at 200°C. Quinoa is a complete protein.',
  },
  {
    id: 'l6', category: 'Lunch',
    name: 'Chicken + Avocado Wrap',
    calories: 540, protein: 44, carbs: 52, fat: 16, prepMins: 8,
    notes: 'Cold chicken works. Half avocado, Greek yoghurt instead of mayo.',
  },
  {
    id: 'l7', category: 'Lunch',
    name: 'Beef Mince + Pasta + Tomato Sauce',
    calories: 620, protein: 50, carbs: 65, fat: 18, prepMins: 18,
    notes: '5% fat mince. Whole grain pasta. Batch cook for the week.',
  },

  // ── DINNER ─────────────────────────────────────────────────────────────────
  {
    id: 'd1', category: 'Dinner',
    name: 'Grilled Chicken + Sweet Potato + Greens',
    calories: 600, protein: 52, carbs: 64, fat: 12, prepMins: 25,
    notes: 'Season chicken with paprika + garlic. Roast sweet potato.',
  },
  {
    id: 'd2', category: 'Dinner',
    name: 'Ribeye Steak + Baked Potato + Asparagus',
    calories: 720, protein: 58, carbs: 62, fat: 24, prepMins: 20,
    notes: 'Rest the steak 5 min. Baked potato — skip the butter.',
  },
  {
    id: 'd3', category: 'Dinner',
    name: 'Salmon + Brown Rice + Edamame',
    calories: 640, protein: 52, carbs: 62, fat: 20, prepMins: 20,
    notes: 'Soy + sesame glaze on the salmon. Simple and elite.',
  },
  {
    id: 'd4', category: 'Dinner',
    name: 'Beef Stir Fry + Rice Noodles',
    calories: 620, protein: 48, carbs: 68, fat: 16, prepMins: 15,
    notes: 'Sirloin steak sliced thin. Ginger, garlic, oyster sauce.',
  },
  {
    id: 'd5', category: 'Dinner',
    name: 'Turkey Mince + Sweet Potato Mash',
    calories: 580, protein: 50, carbs: 58, fat: 14, prepMins: 22,
    notes: 'Season mince with cumin + paprika. Mash with a little milk.',
  },
  {
    id: 'd6', category: 'Dinner',
    name: 'Lamb Chops + Couscous + Roasted Veg',
    calories: 680, protein: 52, carbs: 56, fat: 26, prepMins: 25,
    notes: 'Lamb is high iron. Couscous ready in 5 min. Worth it.',
  },
  {
    id: 'd7', category: 'Dinner',
    name: 'Chicken Thighs + Basmati Rice + Peas',
    calories: 600, protein: 50, carbs: 62, fat: 16, prepMins: 30,
    notes: 'Thighs have more fat than breast — more flavour, still lean.',
  },

  // ── SNACKS ─────────────────────────────────────────────────────────────────
  {
    id: 's1', category: 'Snacks',
    name: 'Greek Yoghurt + Mixed Nuts + Honey',
    calories: 320, protein: 18, carbs: 22, fat: 18, prepMins: 2,
    notes: 'Full-fat yoghurt. Small handful of nuts (30g).',
  },
  {
    id: 's2', category: 'Snacks',
    name: 'Cottage Cheese + Pineapple',
    calories: 240, protein: 22, carbs: 28, fat: 3, prepMins: 1,
    notes: 'High casein — good pre-bed snack for muscle repair.',
  },
  {
    id: 's3', category: 'Snacks',
    name: '3 Hard Boiled Eggs + Rice Cakes',
    calories: 280, protein: 22, carbs: 20, fat: 12, prepMins: 10,
    notes: 'Batch boil 6 eggs on Sunday. Keep in fridge all week.',
  },
  {
    id: 's4', category: 'Snacks',
    name: 'Turkey Slices + Cheddar + Apple',
    calories: 300, protein: 28, carbs: 18, fat: 12, prepMins: 2,
    notes: 'No cook. Grab and go. Use a good cheddar, not processed.',
  },
  {
    id: 's5', category: 'Snacks',
    name: 'Edamame + Sea Salt',
    calories: 200, protein: 17, carbs: 14, fat: 8, prepMins: 5,
    notes: 'Microwave from frozen. Complete protein. Very underrated.',
  },
  {
    id: 's6', category: 'Snacks',
    name: 'Tuna + Whole Grain Crackers',
    calories: 280, protein: 28, carbs: 24, fat: 6, prepMins: 3,
    notes: 'Tinned tuna in water. Squeeze of lemon. Simple.',
  },
  {
    id: 's7', category: 'Snacks',
    name: 'Banana + Peanut Butter (2 tbsp)',
    calories: 320, protein: 10, carbs: 42, fat: 14, prepMins: 1,
    notes: 'Fast energy. Good pre-gym. Natural PB only.',
  },
]

export const CATEGORIES: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']

export function getMealsByCategory(cat: MealCategory): Meal[] {
  return MEALS.filter(m => m.category === cat)
}

// Auto-generate a plan that hits ~3000 cal / 200p / 250c / 80f
export function generateRandomPlan(): Meal[] {
  const pick = (cat: MealCategory) => {
    const options = getMealsByCategory(cat)
    return options[Math.floor(Math.random() * options.length)]
  }

  // Try a few combinations to land closest to targets
  let best: Meal[] = []
  let bestScore = Infinity

  for (let attempt = 0; attempt < 40; attempt++) {
    const plan = [pick('Breakfast'), pick('Lunch'), pick('Dinner'), pick('Snacks'), pick('Snacks')]
    const totals = sumMacros(plan)
    const score =
      Math.abs(totals.calories - TARGETS.calories) * 0.5 +
      Math.abs(totals.protein - TARGETS.protein) * 2 +
      Math.abs(totals.carbs - TARGETS.carbs) * 1 +
      Math.abs(totals.fat - TARGETS.fat) * 1.5
    if (score < bestScore) { bestScore = score; best = plan }
  }

  return best
}

export function sumMacros(meals: Meal[]) {
  return meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}
