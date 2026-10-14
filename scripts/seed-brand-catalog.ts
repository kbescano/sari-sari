import { getPayload } from 'payload'
import config from '../src/payload.config'

// Run order: scripts/reset-catalog.ts must be run first (empties products/categories/orders),
// then the dev server restarted once (so the new itemName/brand NOT NULL columns push cleanly
// onto an empty table), then this script.

const TODAY = new Date('2026-10-14T20:00:00')
// Full September (complete past month) through October 14 (today, month-to-date) — Sept has 30
// days, so day 0 = Sep 1 ... day 29 = Sep 30, day 30 = Oct 1 ... day 43 = Oct 14.
const SEED_SPAN_DAYS = 44

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDateInSeedWindow() {
  const dayOffset = randomInt(0, SEED_SPAN_DAYS - 1)
  const hour = randomInt(7, 20)
  const minute = randomInt(0, 59)
  const second = randomInt(0, 59)
  // month index 8 = September (0-based), day 1 + offset rolls into October automatically
  return new Date(2026, 8, 1 + dayOffset, hour, minute, second)
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  )
}

type UnitType = 'piece' | 'pack' | 'sachet'

// cost/srp are real Philippine sari-sari store peso prices (wholesale cost → suggested retail
// price), sourced from a 2026 sari-sari store price guide that benchmarks against the DTI SRP
// bulletin. Where a specific sub-brand wasn't listed, cost/srp are estimated at the same price
// tier as its sourced neighbors, still in realistic whole-peso (or .50) increments.
interface BrandSpec {
  brand: string
  cost: number
  srp: number
}

interface ItemSpec {
  itemName: string
  unitType: UnitType
  brands: [BrandSpec, BrandSpec, BrandSpec]
}

interface CategorySpec {
  name: string
  slug: string
  displayOrder: number
  items: ItemSpec[]
}

const CATALOG: CategorySpec[] = [
  {
    name: 'Drinks',
    slug: 'drinks',
    displayOrder: 1,
    items: [
      {
        itemName: 'Coffee 3-in-1 Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Nescafé', cost: 12.5, srp: 16 },
          { brand: 'Kopiko Brown', cost: 13, srp: 17 },
          { brand: 'Great Taste White', cost: 12, srp: 16 },
        ],
      },
      {
        itemName: 'Powdered Juice',
        unitType: 'sachet',
        brands: [
          { brand: 'Tang', cost: 6, srp: 9 },
          { brand: "Eight O'Clock", cost: 5.5, srp: 8 },
          { brand: 'Sun-Up', cost: 5, srp: 8 },
        ],
      },
      {
        itemName: 'Bottled Water (500ml)',
        unitType: 'piece',
        brands: [
          { brand: 'Wilkins', cost: 11, srp: 15 },
          { brand: "Nature's Spring", cost: 10, srp: 14 },
          { brand: 'Absolute', cost: 10.5, srp: 14.5 },
        ],
      },
      {
        itemName: 'Soft Drink (Mismo 295ml)',
        unitType: 'piece',
        brands: [
          { brand: 'Coca-Cola', cost: 16.5, srp: 22 },
          { brand: 'Sprite', cost: 16.5, srp: 22 },
          { brand: 'Royal Tru-Orange', cost: 16.5, srp: 22 },
        ],
      },
      {
        itemName: 'Fruit Juice Drink',
        unitType: 'piece',
        brands: [
          { brand: 'Zesto Juice Box', cost: 9.5, srp: 13 },
          { brand: 'Minute Maid Pulpy Orange', cost: 18, srp: 25 },
          { brand: 'Del Monte Pineapple Juice', cost: 24, srp: 32 },
        ],
      },
      {
        itemName: 'Iced Tea',
        unitType: 'piece',
        brands: [
          { brand: 'C2 Green Tea', cost: 24, srp: 30 },
          { brand: 'Lipton', cost: 22, srp: 28 },
          { brand: 'Nestea', cost: 20, srp: 26 },
        ],
      },
      {
        itemName: 'Energy Drink',
        unitType: 'piece',
        brands: [
          { brand: 'Cobra', cost: 18, srp: 24 },
          { brand: 'Sting', cost: 22, srp: 28 },
          { brand: 'Red Bull', cost: 45, srp: 55 },
        ],
      },
      {
        itemName: 'Isotonic/Sports Drink',
        unitType: 'piece',
        brands: [
          { brand: 'Gatorade', cost: 42, srp: 50 },
          { brand: 'Pocari Sweat', cost: 48, srp: 58 },
          { brand: 'Lipovitan', cost: 16, srp: 22 },
        ],
      },
      {
        itemName: 'Chocolate Drink Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Milo', cost: 11, srp: 15 },
          { brand: 'Ovaltine', cost: 9, srp: 13 },
          { brand: 'Nesquik', cost: 10, srp: 14 },
        ],
      },
      {
        itemName: 'Beer',
        unitType: 'piece',
        brands: [
          { brand: 'San Miguel Pale Pilsen', cost: 38, srp: 48 },
          { brand: 'Red Horse', cost: 42, srp: 52 },
          { brand: 'Colt 45', cost: 36, srp: 45 },
        ],
      },
    ],
  },
  {
    name: 'Snacks',
    slug: 'snacks',
    displayOrder: 2,
    items: [
      {
        itemName: 'Biscuits',
        unitType: 'pack',
        brands: [
          { brand: 'SkyFlakes', cost: 8.5, srp: 12 },
          { brand: 'Fita', cost: 8.5, srp: 12 },
          { brand: 'Hansel Sandwich', cost: 9, srp: 13 },
        ],
      },
      {
        itemName: 'Crackers',
        unitType: 'pack',
        brands: [
          { brand: 'M.Y. San Grahams', cost: 9, srp: 13 },
          { brand: 'Rebisco Sandwich', cost: 8.5, srp: 12 },
          { brand: 'Presto Creams', cost: 8, srp: 11 },
        ],
      },
      {
        itemName: 'Potato/Corn Chips',
        unitType: 'pack',
        brands: [
          { brand: 'Piattos', cost: 16, srp: 22 },
          { brand: 'Nova Multigrain', cost: 16, srp: 22 },
          { brand: 'Clover Chips', cost: 14, srp: 20 },
        ],
      },
      {
        itemName: 'Flavored Chips',
        unitType: 'pack',
        brands: [
          { brand: 'Chippy Barbecue', cost: 8, srp: 12 },
          { brand: 'Oishi Prawn Crackers', cost: 8, srp: 12 },
          { brand: 'V-Cut Spicy BBQ', cost: 16, srp: 22 },
        ],
      },
      {
        itemName: 'Tingi Candy (per piece)',
        unitType: 'piece',
        brands: [
          { brand: 'Maxx Candy', cost: 0.55, srp: 1 },
          { brand: 'Snow Bear Candy', cost: 0.55, srp: 1 },
          { brand: 'Choc-Nut', cost: 1.5, srp: 3 },
        ],
      },
      {
        itemName: 'Chocolate Bar',
        unitType: 'piece',
        brands: [
          { brand: 'Cloud 9 Mini', cost: 7, srp: 10 },
          { brand: 'Stick-O Junior', cost: 10, srp: 15 },
          { brand: 'KitKat 2-Finger', cost: 18, srp: 25 },
        ],
      },
      {
        itemName: 'Candy & Gum',
        unitType: 'piece',
        brands: [
          { brand: 'Marbles Bubble Gum', cost: 1, srp: 2 },
          { brand: 'Lollipop', cost: 1.5, srp: 3 },
          { brand: 'Mentos (single roll)', cost: 14, srp: 18 },
        ],
      },
      {
        itemName: 'Wafer & Hopia',
        unitType: 'piece',
        brands: [
          { brand: 'Eng Bee Tin Hopia', cost: 12, srp: 16 },
          { brand: 'White Rabbit', cost: 1.5, srp: 3 },
          { brand: 'Toblerone Tiny', cost: 22, srp: 30 },
        ],
      },
      {
        itemName: 'Nuts',
        unitType: 'pack',
        brands: [
          { brand: 'Boy Bawang', cost: 22, srp: 28 },
          { brand: 'Ding Dong Mixed Nuts', cost: 8.5, srp: 12 },
          { brand: 'Roller Coaster', cost: 14, srp: 20 },
        ],
      },
      {
        itemName: 'Cheese Snacks',
        unitType: 'pack',
        brands: [
          { brand: 'Cheese Ring', cost: 11, srp: 15 },
          { brand: 'Mr. Chips', cost: 14, srp: 20 },
          { brand: "Marty's Cracklin'", cost: 22, srp: 28 },
        ],
      },
    ],
  },
  {
    name: 'Canned Goods',
    slug: 'canned-goods',
    displayOrder: 3,
    items: [
      {
        itemName: 'Sardines',
        unitType: 'piece',
        brands: [
          { brand: 'Mega Sardines Green', cost: 22.5, srp: 28 },
          { brand: '555 Sardines', cost: 21, srp: 26 },
          { brand: 'Ligo Sardines Chili', cost: 23, srp: 28 },
        ],
      },
      {
        itemName: 'Corned Beef',
        unitType: 'piece',
        brands: [
          { brand: 'Argentina', cost: 42, srp: 50 },
          { brand: 'Purefoods Star', cost: 36, srp: 42 },
          { brand: 'CDO Karne Norte', cost: 32, srp: 38 },
        ],
      },
      {
        itemName: 'Tuna',
        unitType: 'piece',
        brands: [
          { brand: 'Century Tuna Flakes in Oil', cost: 41, srp: 48 },
          { brand: '555 Tuna Spanish Style', cost: 35, srp: 42 },
          { brand: 'San Marino', cost: 30, srp: 36 },
        ],
      },
      {
        itemName: 'Luncheon Meat',
        unitType: 'piece',
        brands: [
          { brand: 'Purefoods Luncheon Meat', cost: 88, srp: 105 },
          { brand: 'Spam', cost: 120, srp: 140 },
          { brand: 'Swift', cost: 90, srp: 108 },
        ],
      },
      {
        itemName: 'Meatloaf',
        unitType: 'piece',
        brands: [
          { brand: 'Argentina Meat Loaf', cost: 25, srp: 30 },
          { brand: 'CDO', cost: 26, srp: 32 },
          { brand: 'Swift', cost: 24, srp: 30 },
        ],
      },
      {
        itemName: 'Vienna Sausage',
        unitType: 'piece',
        brands: [
          { brand: 'Purefoods', cost: 32, srp: 40 },
          { brand: 'CDO', cost: 33, srp: 41 },
          { brand: 'Swift', cost: 31, srp: 39 },
        ],
      },
      {
        itemName: 'Fruit Cocktail',
        unitType: 'piece',
        brands: [
          { brand: 'Del Monte', cost: 95, srp: 115 },
          { brand: 'Dole', cost: 90, srp: 110 },
          { brand: 'SunKist', cost: 85, srp: 105 },
        ],
      },
      {
        itemName: 'Liver Spread',
        unitType: 'piece',
        brands: [
          { brand: 'CDO', cost: 22, srp: 28 },
          { brand: 'Purefoods', cost: 23, srp: 29 },
          { brand: 'Reno', cost: 20, srp: 26 },
        ],
      },
      {
        itemName: 'Tomato Sauce',
        unitType: 'piece',
        brands: [
          { brand: 'Del Monte', cost: 18, srp: 24 },
          { brand: 'UFC', cost: 17, srp: 23 },
          { brand: 'Jufran', cost: 16, srp: 22 },
        ],
      },
      {
        itemName: 'Spaghetti Sauce',
        unitType: 'piece',
        brands: [
          { brand: 'Del Monte', cost: 35, srp: 42 },
          { brand: 'UFC', cost: 32, srp: 40 },
          { brand: 'Jufran', cost: 30, srp: 38 },
        ],
      },
    ],
  },
  {
    name: 'Instant Noodles',
    slug: 'instant-noodles',
    displayOrder: 4,
    items: [
      {
        itemName: 'Instant Pancit Canton',
        unitType: 'piece',
        brands: [
          { brand: 'Lucky Me! Original', cost: 14.5, srp: 18 },
          { brand: 'Payless Xtra Big', cost: 16, srp: 20 },
          { brand: 'Quickchow', cost: 12, srp: 16 },
        ],
      },
      {
        itemName: 'Flavored Pancit Canton',
        unitType: 'piece',
        brands: [
          { brand: 'Lucky Me! Chilimansi', cost: 14.5, srp: 18 },
          { brand: 'Lucky Me! Sweet & Spicy', cost: 14.5, srp: 18 },
          { brand: 'Payless', cost: 13, srp: 17 },
        ],
      },
      {
        itemName: 'Instant Mami',
        unitType: 'piece',
        brands: [
          { brand: 'Lucky Me! Beef Mami', cost: 10.5, srp: 14 },
          { brand: 'Lucky Me! Chicken Mami', cost: 10.5, srp: 14 },
          { brand: 'Homi', cost: 9.5, srp: 13 },
        ],
      },
      {
        itemName: 'Cup Noodles',
        unitType: 'piece',
        brands: [
          { brand: 'Nissin Cup Noodles Seafood', cost: 21, srp: 26 },
          { brand: 'Nissin Yakisoba', cost: 32, srp: 40 },
          { brand: 'Payless', cost: 16, srp: 20 },
        ],
      },
      {
        itemName: 'La Paz Batchoy',
        unitType: 'piece',
        brands: [
          { brand: 'Lucky Me!', cost: 10.5, srp: 14 },
          { brand: 'Payless', cost: 9, srp: 13 },
          { brand: 'Quickchow', cost: 9, srp: 12 },
        ],
      },
      {
        itemName: 'Sotanghon',
        unitType: 'piece',
        brands: [
          { brand: 'Generic (small pack)', cost: 18, srp: 25 },
          { brand: 'Lucky Me!', cost: 16, srp: 22 },
          { brand: 'Payless', cost: 15, srp: 20 },
        ],
      },
      {
        itemName: 'Bihon',
        unitType: 'piece',
        brands: [
          { brand: 'Generic (small pack)', cost: 18, srp: 25 },
          { brand: 'Lucky Me!', cost: 16, srp: 22 },
          { brand: 'Payless', cost: 15, srp: 20 },
        ],
      },
      {
        itemName: 'Misua',
        unitType: 'piece',
        brands: [
          { brand: 'Generic (small pack)', cost: 8, srp: 12 },
          { brand: 'Lucky Me!', cost: 7.5, srp: 11.5 },
          { brand: 'Payless', cost: 7, srp: 11 },
        ],
      },
      {
        itemName: 'Spaghetti Pasta (500g)',
        unitType: 'piece',
        brands: [
          { brand: 'Generic', cost: 62, srp: 75 },
          { brand: 'Royal', cost: 65, srp: 78 },
          { brand: 'Fiesta', cost: 58, srp: 70 },
        ],
      },
      {
        itemName: 'Spicy Ramen',
        unitType: 'piece',
        brands: [
          { brand: 'Samyang', cost: 38, srp: 48 },
          { brand: 'Nongshim', cost: 36, srp: 45 },
          { brand: 'Nissin', cost: 30, srp: 38 },
        ],
      },
    ],
  },
  {
    name: 'Cooking Essentials',
    slug: 'cooking-essentials',
    displayOrder: 5,
    items: [
      {
        itemName: 'Cooking Oil (1L)',
        unitType: 'piece',
        brands: [
          { brand: 'Golden Fiesta', cost: 145, srp: 170 },
          { brand: 'Palm Cooking Oil', cost: 135, srp: 160 },
          { brand: 'Minola', cost: 130, srp: 155 },
        ],
      },
      {
        itemName: 'Soy Sauce (200ml)',
        unitType: 'piece',
        brands: [
          { brand: 'Silver Swan', cost: 12.5, srp: 16 },
          { brand: 'Datu Puti', cost: 12.5, srp: 16 },
          { brand: 'UFC', cost: 11, srp: 15 },
        ],
      },
      {
        itemName: 'Vinegar',
        unitType: 'piece',
        brands: [
          { brand: 'Silver Swan (200ml)', cost: 10.5, srp: 14 },
          { brand: 'Datu Puti (385ml)', cost: 22, srp: 28 },
          { brand: 'Pinakurat', cost: 18, srp: 24 },
        ],
      },
      {
        itemName: 'Rice (per kilo)',
        unitType: 'piece',
        brands: [
          { brand: 'Sinandomeng', cost: 52, srp: 60 },
          { brand: 'Dinorado', cost: 62, srp: 72 },
          { brand: 'Jasmine', cost: 58, srp: 66 },
        ],
      },
      {
        itemName: 'Salt (small pack)',
        unitType: 'piece',
        brands: [
          { brand: 'Asin Iodized', cost: 5.5, srp: 8 },
          { brand: 'Pacific', cost: 5, srp: 7.5 },
          { brand: 'Star', cost: 6, srp: 8.5 },
        ],
      },
      {
        itemName: 'Sugar (per 1/4 kg)',
        unitType: 'piece',
        brands: [
          { brand: 'Brown Sugar', cost: 20, srp: 25 },
          { brand: 'White Sugar', cost: 22, srp: 28 },
          { brand: 'Victorias', cost: 21, srp: 26 },
        ],
      },
      {
        itemName: 'Flour (per 1/4 kg)',
        unitType: 'piece',
        brands: [
          { brand: 'Generic All-Purpose', cost: 18, srp: 25 },
          { brand: 'Maya', cost: 20, srp: 27 },
          { brand: 'Pillsbury', cost: 22, srp: 30 },
        ],
      },
      {
        itemName: 'Seasoning (Vetsin)',
        unitType: 'sachet',
        brands: [
          { brand: 'Ajinomoto', cost: 4.5, srp: 7 },
          { brand: 'Knorr', cost: 5, srp: 8 },
          { brand: 'UFC', cost: 4, srp: 6.5 },
        ],
      },
      {
        itemName: 'Seasoning Cube',
        unitType: 'sachet',
        brands: [
          { brand: 'Knorr Cube', cost: 6, srp: 9 },
          { brand: 'Magic Sarap', cost: 5.5, srp: 8 },
          { brand: 'Maggi', cost: 5.5, srp: 8 },
        ],
      },
      {
        itemName: 'Garlic (per 100g)',
        unitType: 'piece',
        brands: [
          { brand: 'Local Harvest', cost: 8, srp: 12 },
          { brand: 'Benguet Farms', cost: 9, srp: 13 },
          { brand: 'Imported', cost: 7, srp: 11 },
        ],
      },
    ],
  },
  {
    name: 'Toiletries & Personal Care',
    slug: 'toiletries-personal-care',
    displayOrder: 6,
    items: [
      {
        itemName: 'Shampoo Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Sunsilk', cost: 7.5, srp: 11 },
          { brand: 'Palmolive', cost: 7.5, srp: 11 },
          { brand: 'Pantene', cost: 8, srp: 12 },
        ],
      },
      {
        itemName: 'Soap Bar',
        unitType: 'piece',
        brands: [
          { brand: 'Safeguard', cost: 22, srp: 28 },
          { brand: 'Bioderm', cost: 18, srp: 24 },
          { brand: 'Silka Papaya', cost: 35, srp: 45 },
        ],
      },
      {
        itemName: 'Toothpaste Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Colgate', cost: 4, srp: 7 },
          { brand: 'Close-Up', cost: 4, srp: 7 },
          { brand: 'Hapee', cost: 3.5, srp: 6 },
        ],
      },
      {
        itemName: 'Toothbrush',
        unitType: 'piece',
        brands: [
          { brand: 'Colgate', cost: 12, srp: 18 },
          { brand: 'Oral-B', cost: 18, srp: 25 },
          { brand: 'Systema', cost: 16, srp: 22 },
        ],
      },
      {
        itemName: 'Deodorant Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Rexona', cost: 11, srp: 15 },
          { brand: 'Dove', cost: 12, srp: 16 },
          { brand: 'Nivea', cost: 13, srp: 17 },
        ],
      },
      {
        itemName: 'Lotion',
        unitType: 'piece',
        brands: [
          { brand: 'Belo', cost: 30, srp: 40 },
          { brand: 'Nivea', cost: 28, srp: 38 },
          { brand: "Pond's", cost: 26, srp: 36 },
        ],
      },
      {
        itemName: 'Facial Wash',
        unitType: 'piece',
        brands: [
          { brand: 'Belo', cost: 28, srp: 38 },
          { brand: "Pond's", cost: 26, srp: 36 },
          { brand: 'Garnier', cost: 30, srp: 40 },
        ],
      },
      {
        itemName: 'Cotton Buds/Balls',
        unitType: 'pack',
        brands: [
          { brand: 'Generic Cotton Buds', cost: 10, srp: 15 },
          { brand: 'Generic Cotton Balls', cost: 12, srp: 18 },
          { brand: "Johnson's", cost: 11, srp: 16 },
        ],
      },
      {
        itemName: 'Razor',
        unitType: 'piece',
        brands: [
          { brand: 'Gillette', cost: 14, srp: 20 },
          { brand: 'Bic', cost: 10, srp: 16 },
          { brand: 'Schick', cost: 13, srp: 19 },
        ],
      },
      {
        itemName: 'Feminine Pad',
        unitType: 'pack',
        brands: [
          { brand: 'Modess', cost: 8.5, srp: 12 },
          { brand: 'Whisper', cost: 8.5, srp: 12 },
          { brand: 'Lactacyd', cost: 30, srp: 40 },
        ],
      },
    ],
  },
  {
    name: 'Household Supplies',
    slug: 'household-supplies',
    displayOrder: 7,
    items: [
      {
        itemName: 'Laundry Detergent Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Surf Powder Twin Pack', cost: 12.5, srp: 17 },
          { brand: 'Ariel Powder Twin Pack', cost: 13, srp: 18 },
          { brand: 'Tide Powder Twin Pack', cost: 12.5, srp: 17 },
        ],
      },
      {
        itemName: 'Fabric Conditioner Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Downy', cost: 7.5, srp: 11 },
          { brand: 'Surf', cost: 7.5, srp: 11 },
          { brand: 'Generic', cost: 7, srp: 10.5 },
        ],
      },
      {
        itemName: 'Laundry Bar Soap',
        unitType: 'piece',
        brands: [
          { brand: 'Surf Bar Soap (Long Bar)', cost: 22, srp: 30 },
          { brand: 'Pride Detergent Bar', cost: 8, srp: 12 },
          { brand: 'Champion Detergent Bar', cost: 9, srp: 13 },
        ],
      },
      {
        itemName: 'Bleach',
        unitType: 'piece',
        brands: [
          { brand: 'Zonrox (250ml)', cost: 18, srp: 24 },
          { brand: 'Zonrox Color Safe (500ml)', cost: 38, srp: 50 },
          { brand: 'Generic', cost: 16, srp: 22 },
        ],
      },
      {
        itemName: 'Dishwashing Liquid',
        unitType: 'sachet',
        brands: [
          { brand: 'Joy Sachet', cost: 12, srp: 16 },
          { brand: 'Joy (250ml)', cost: 45, srp: 58 },
          { brand: 'Ajax', cost: 11, srp: 15 },
        ],
      },
      {
        itemName: 'Insecticide Spray',
        unitType: 'piece',
        brands: [
          { brand: 'Baygon', cost: 95, srp: 120 },
          { brand: 'Raid', cost: 90, srp: 115 },
          { brand: 'Hit', cost: 85, srp: 110 },
        ],
      },
      {
        itemName: 'Air Freshener',
        unitType: 'piece',
        brands: [
          { brand: 'Glade', cost: 75, srp: 95 },
          { brand: 'Ambipur', cost: 70, srp: 90 },
          { brand: 'Airwick', cost: 72, srp: 92 },
        ],
      },
      {
        itemName: 'Candles',
        unitType: 'piece',
        brands: [
          { brand: 'Everlite', cost: 4, srp: 7 },
          { brand: 'Fire Fly', cost: 4.5, srp: 7.5 },
          { brand: 'Local', cost: 3.5, srp: 6 },
        ],
      },
      {
        itemName: 'Matches (per box)',
        unitType: 'piece',
        brands: [
          { brand: "D' Match", cost: 3, srp: 5 },
          { brand: 'Three Star', cost: 2.5, srp: 4.5 },
          { brand: 'Local', cost: 3.5, srp: 5.5 },
        ],
      },
      {
        itemName: 'Household Cleaning Tools',
        unitType: 'piece',
        brands: [
          { brand: 'Scotch-Brite Scouring Pad', cost: 15, srp: 22 },
          { brand: 'Steel Wool (per pack)', cost: 8, srp: 12 },
          { brand: 'Generic Sponge', cost: 10, srp: 15 },
        ],
      },
    ],
  },
  {
    name: 'Dairy & Breakfast',
    slug: 'dairy-breakfast',
    displayOrder: 8,
    items: [
      {
        itemName: 'Powdered Milk',
        unitType: 'sachet',
        brands: [
          { brand: 'Bear Brand', cost: 15, srp: 20 },
          { brand: 'Birch Tree', cost: 14, srp: 19 },
          { brand: 'Alaska', cost: 16, srp: 21 },
        ],
      },
      {
        itemName: 'Condensed Milk',
        unitType: 'piece',
        brands: [
          { brand: 'Alaska Condensada', cost: 62, srp: 72 },
          { brand: 'Liberty Condensada', cost: 60, srp: 70 },
          { brand: 'Nestle', cost: 63, srp: 73 },
        ],
      },
      {
        itemName: 'Evaporated Milk',
        unitType: 'piece',
        brands: [
          { brand: 'Alaska Evaporada', cost: 43, srp: 50 },
          { brand: 'Carnation Evaporada', cost: 45, srp: 52 },
          { brand: 'Liberty', cost: 44, srp: 51 },
        ],
      },
      {
        itemName: 'Margarine',
        unitType: 'piece',
        brands: [
          { brand: 'Star Margarine', cost: 38, srp: 48 },
          { brand: 'Magnolia', cost: 36, srp: 46 },
          { brand: 'Buttercup', cost: 34, srp: 44 },
        ],
      },
      {
        itemName: 'Cheese',
        unitType: 'piece',
        brands: [
          { brand: 'Eden Cheese (165g block)', cost: 78, srp: 95 },
          { brand: 'Quickmelt Cheese (165g)', cost: 78, srp: 95 },
          { brand: 'Cheez Whiz Pouch (220g)', cost: 78, srp: 95 },
        ],
      },
      {
        itemName: 'Bread',
        unitType: 'piece',
        brands: [
          { brand: 'Gardenia Classic White (600g)', cost: 78, srp: 92 },
          { brand: 'Gardenia Whole Wheat (450g)', cost: 88, srp: 105 },
          { brand: 'Loaf Bread Tasty (450g)', cost: 65, srp: 80 },
        ],
      },
      {
        itemName: 'Coffee Creamer',
        unitType: 'sachet',
        brands: [
          { brand: 'Coffee-Mate', cost: 1.5, srp: 3 },
          { brand: 'Birch Tree Creamer', cost: 7.5, srp: 11 },
          { brand: 'Liberty', cost: 6, srp: 10 },
        ],
      },
      {
        itemName: 'Breakfast Cereal',
        unitType: 'piece',
        brands: [
          { brand: 'Nestle Koko Krunch', cost: 55, srp: 70 },
          { brand: "Kellogg's", cost: 58, srp: 72 },
          { brand: 'Quaker', cost: 50, srp: 65 },
        ],
      },
      {
        itemName: 'Hotdog (1kg)',
        unitType: 'piece',
        brands: [
          { brand: 'Purefoods Tender Juicy', cost: 235, srp: 270 },
          { brand: 'CDO Classic', cost: 215, srp: 250 },
          { brand: 'Swift', cost: 200, srp: 235 },
        ],
      },
      {
        itemName: 'Yogurt / Cultured Drink',
        unitType: 'piece',
        brands: [
          { brand: 'Yakult', cost: 8.5, srp: 12 },
          { brand: 'Vitamilk Soya', cost: 22, srp: 28 },
          { brand: 'Dutch Mill', cost: 20, srp: 26 },
        ],
      },
    ],
  },
  {
    name: 'Baby Care',
    slug: 'baby-care',
    displayOrder: 9,
    items: [
      {
        itemName: 'Diapers',
        unitType: 'piece',
        brands: [
          { brand: 'EQ Medium', cost: 9, srp: 13 },
          { brand: 'Pampers Baby-Dry Medium', cost: 12, srp: 16 },
          { brand: 'Huggies Dry Medium', cost: 11, srp: 15 },
        ],
      },
      {
        itemName: 'Baby Powder',
        unitType: 'piece',
        brands: [
          { brand: "Johnson's", cost: 32, srp: 42 },
          { brand: 'Belo Baby', cost: 30, srp: 40 },
          { brand: 'Cussons', cost: 28, srp: 38 },
        ],
      },
      {
        itemName: 'Baby Wipes',
        unitType: 'pack',
        brands: [
          { brand: 'Generic (30s)', cost: 22, srp: 32 },
          { brand: 'Pampers', cost: 24, srp: 34 },
          { brand: 'Huggies', cost: 23, srp: 33 },
        ],
      },
      {
        itemName: 'Baby Shampoo',
        unitType: 'piece',
        brands: [
          { brand: "Johnson's (50ml)", cost: 38, srp: 50 },
          { brand: 'Belo Baby', cost: 35, srp: 47 },
          { brand: 'Cussons', cost: 33, srp: 45 },
        ],
      },
      {
        itemName: 'Baby Cologne',
        unitType: 'piece',
        brands: [
          { brand: "Johnson's", cost: 45, srp: 58 },
          { brand: 'Baby Bench', cost: 40, srp: 52 },
          { brand: 'Perla', cost: 38, srp: 50 },
        ],
      },
      {
        itemName: 'Baby Soap',
        unitType: 'piece',
        brands: [
          { brand: "Johnson's", cost: 16, srp: 22 },
          { brand: 'Belo Baby', cost: 15, srp: 21 },
          { brand: 'Safeguard Baby', cost: 14, srp: 20 },
        ],
      },
      {
        itemName: 'Baby Lotion',
        unitType: 'piece',
        brands: [
          { brand: "Johnson's", cost: 28, srp: 38 },
          { brand: 'Belo Baby', cost: 26, srp: 36 },
          { brand: 'Cussons', cost: 24, srp: 34 },
        ],
      },
      {
        itemName: 'Baby Formula Sachet',
        unitType: 'sachet',
        brands: [
          { brand: 'Lactum 0-6/6-12', cost: 28, srp: 38 },
          { brand: 'Promil Gold', cost: 32, srp: 42 },
          { brand: 'Bonna', cost: 28, srp: 38 },
        ],
      },
      {
        itemName: 'Cotton Balls',
        unitType: 'pack',
        brands: [
          { brand: 'Generic', cost: 12, srp: 18 },
          { brand: "Johnson's", cost: 13, srp: 19 },
          { brand: 'Baby Soft', cost: 11, srp: 17 },
        ],
      },
      {
        itemName: 'Feeding Bottle',
        unitType: 'piece',
        brands: [
          { brand: 'NUK', cost: 65, srp: 85 },
          { brand: 'Pigeon', cost: 70, srp: 90 },
          { brand: 'Avent', cost: 85, srp: 110 },
        ],
      },
    ],
  },
  {
    name: 'Load & School Supplies',
    slug: 'load-school-supplies',
    displayOrder: 10,
    items: [
      {
        itemName: 'Prepaid Load ₱10',
        unitType: 'piece',
        brands: [
          { brand: 'Globe', cost: 9.7, srp: 10 },
          { brand: 'Smart', cost: 9.7, srp: 10 },
          { brand: 'DITO', cost: 9.7, srp: 10 },
        ],
      },
      {
        itemName: 'Prepaid Load ₱20',
        unitType: 'piece',
        brands: [
          { brand: 'Globe', cost: 19, srp: 20 },
          { brand: 'Smart', cost: 19, srp: 20 },
          { brand: 'DITO', cost: 19, srp: 20 },
        ],
      },
      {
        itemName: 'Prepaid Load ₱30',
        unitType: 'piece',
        brands: [
          { brand: 'Globe', cost: 29, srp: 30 },
          { brand: 'Smart', cost: 29, srp: 30 },
          { brand: 'DITO', cost: 29, srp: 30 },
        ],
      },
      {
        itemName: 'Prepaid Load ₱50',
        unitType: 'piece',
        brands: [
          { brand: 'Globe', cost: 48, srp: 50 },
          { brand: 'Smart', cost: 48, srp: 50 },
          { brand: 'DITO', cost: 48, srp: 50 },
        ],
      },
      {
        itemName: 'Prepaid Load ₱100',
        unitType: 'piece',
        brands: [
          { brand: 'Globe', cost: 97, srp: 100 },
          { brand: 'Smart', cost: 97, srp: 100 },
          { brand: 'DITO', cost: 97, srp: 100 },
        ],
      },
      {
        itemName: 'Ballpen',
        unitType: 'piece',
        brands: [
          { brand: 'Panda', cost: 5, srp: 8 },
          { brand: 'HBW', cost: 6, srp: 10 },
          { brand: 'Pilot', cost: 22, srp: 30 },
        ],
      },
      {
        itemName: 'Notebook',
        unitType: 'piece',
        brands: [
          { brand: '80 Pages', cost: 18, srp: 25 },
          { brand: 'Spiral 80lvs', cost: 28, srp: 38 },
          { brand: 'Veco', cost: 20, srp: 28 },
        ],
      },
      {
        itemName: 'Pencil',
        unitType: 'piece',
        brands: [
          { brand: 'Mongol No. 2', cost: 6, srp: 10 },
          { brand: 'Faber-Castell', cost: 7, srp: 11 },
          { brand: 'Staedtler', cost: 5.5, srp: 9.5 },
        ],
      },
      {
        itemName: 'Eraser',
        unitType: 'piece',
        brands: [
          { brand: 'Faber-Castell', cost: 4, srp: 7 },
          { brand: 'Mars Plastic', cost: 3.5, srp: 6.5 },
          { brand: 'Deli', cost: 4.5, srp: 7.5 },
        ],
      },
      {
        itemName: 'Sharpener',
        unitType: 'piece',
        brands: [
          { brand: 'Faber-Castell', cost: 8, srp: 12 },
          { brand: 'Deli', cost: 7.5, srp: 11.5 },
          { brand: 'Panda', cost: 8.5, srp: 12.5 },
        ],
      },
    ],
  },
]

async function main() {
  const payload = await getPayload({ config })

  // --- Persistent test users (kept, not cleaned up by reset-catalog.ts) ---
  async function ensureUser(email: string, role: 'owner' | 'staff') {
    const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
    if (existing.docs[0]) return existing.docs[0]
    const user = await payload.create({ collection: 'users', data: { email, password: 'TestSariSari123', role } })
    console.log(`Created user: ${email} (${role})`)
    return user
  }
  await ensureUser('owner@sarisari.com', 'owner')
  await ensureUser('staff@sarisari.com', 'staff')

  // --- Categories ---
  const categoryIdBySlug = new Map<string, number>()
  for (const cat of CATALOG) {
    const doc = await payload.create({
      collection: 'categories',
      data: { name: cat.name, slug: cat.slug, displayOrder: cat.displayOrder },
    })
    categoryIdBySlug.set(cat.slug, Number(doc.id))
    console.log(`Created category: ${cat.name}`)
  }

  // --- Products: 10 categories x 10 items x 3 brands = 300 ---
  interface ProductRecord {
    id: number
    stockQuantity: number
    popularity: number
    unitPrice: number
    costPrice: number
  }
  const products: ProductRecord[] = []
  let createdCount = 0

  // Deliberate stock tiers so the Inventory "Low Stock" tab and dashboards have real signal
  // instead of everything looking comfortably stocked: most products are healthy, but a
  // meaningful slice starts low (likely to run out from simulated sales on top) or already
  // at zero (needs restocking).
  function randomStartingStock() {
    const roll = Math.random()
    if (roll < 0.06) return 0 // already out of stock
    if (roll < 0.2) return randomInt(3, 15) // low — a sale or two away from empty
    return randomInt(20, 140) // healthy
  }

  const DB_CONCURRENCY = 15

  async function runInBatches<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
    const results: R[] = []
    for (let i = 0; i < items.length; i += DB_CONCURRENCY) {
      const batch = items.slice(i, i + DB_CONCURRENCY)
      results.push(...(await Promise.all(batch.map(worker))))
    }
    return results
  }

  interface ProductSpec {
    categoryId: number
    itemName: string
    brand: string
    title: string
    costPrice: number
    markupValue: number
    unitType: UnitType
    stockQuantity: number
    popularity: number
  }

  const productSpecs: ProductSpec[] = []
  for (const cat of CATALOG) {
    const categoryId = categoryIdBySlug.get(cat.slug)!
    for (const item of cat.items) {
      for (const brandSpec of item.brands) {
        const { brand, cost: costPrice, srp: sellingPrice } = brandSpec
        // Fixed-peso markup makes sellingPrice land exactly on the real sourced SRP —
        // no percentage-rounding drift into odd cents.
        const markupValue = Math.round((sellingPrice - costPrice) * 100) / 100
        productSpecs.push({
          categoryId,
          itemName: item.itemName,
          brand,
          title: `${item.itemName} (${brand})`,
          costPrice,
          markupValue,
          unitType: item.unitType,
          stockQuantity: randomStartingStock(),
          popularity: Math.random() < 0.12 ? randomInt(20, 45) : randomInt(1, 14),
        })
      }
    }
  }

  await runInBatches(productSpecs, async (spec) => {
    const product = await payload.create({
      collection: 'products',
      data: {
        title: spec.title,
        itemName: spec.itemName,
        brand: spec.brand,
        slug: slugify(spec.title),
        category: spec.categoryId,
        costPrice: spec.costPrice,
        markupType: 'fixed',
        markupValue: spec.markupValue,
        sellingPrice: spec.costPrice,
        unitType: spec.unitType,
        stockQuantity: spec.stockQuantity,
        isActive: true,
      },
    })
    products.push({
      id: Number(product.id),
      stockQuantity: spec.stockQuantity,
      popularity: spec.popularity,
      unitPrice: product.sellingPrice,
      costPrice: product.costPrice,
    })
    createdCount++
  })
  console.log(`Created ${createdCount} products across ${CATALOG.length} categories.`)

  // --- Orders: weighted-random sales spread across Sep 1 - Oct 14, decrementing in-memory stock ---
  const remainingStock = new Map(products.map((p) => [p.id, p.stockQuantity]))

  function pickWeightedProduct(): ProductRecord | null {
    const available = products.filter((p) => (remainingStock.get(p.id) ?? 0) > 0)
    if (available.length === 0) return null
    const availableWeight = available.reduce((sum, p) => sum + p.popularity, 0)
    let roll = Math.random() * availableWeight
    for (const p of available) {
      roll -= p.popularity
      if (roll <= 0) return p
    }
    return available[available.length - 1] ?? null
  }

  // Scaled for a 44-day window (vs. the original 14-day month-to-date) to keep a similar
  // daily order density.
  const ORDER_COUNT = 750

  interface OrderSpec {
    orderNumber: string
    items: { product: number; quantity: number; unitPrice: number; costPrice: number }[]
    totalAmount: number
    createdAt: string
  }

  // Build every order's contents synchronously first (picking products + decrementing the
  // shared in-memory stock map is all pure/sync here), then fire the actual DB writes in
  // concurrent batches below — safe because the stock accounting never touches the network.
  const orderSpecs: OrderSpec[] = []
  let orderSeq = 1
  for (let i = 0; i < ORDER_COUNT; i++) {
    const lineCount = randomInt(1, 4)
    const chosenIds = new Set<number>()
    const items: OrderSpec['items'] = []

    for (let l = 0; l < lineCount; l++) {
      const picked = pickWeightedProduct()
      if (!picked || chosenIds.has(picked.id)) continue
      const remaining = remainingStock.get(picked.id) ?? 0
      if (remaining <= 0) continue

      const quantity = Math.min(randomInt(1, 5), remaining)
      remainingStock.set(picked.id, remaining - quantity)
      chosenIds.add(picked.id)

      items.push({
        product: picked.id,
        quantity,
        unitPrice: picked.unitPrice,
        costPrice: picked.costPrice,
      })
    }

    if (items.length === 0) continue

    const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
    const createdAt = randomDateInSeedWindow()

    orderSpecs.push({
      orderNumber: `SS-${createdAt.getTime().toString(36).toUpperCase()}-${orderSeq}`,
      items,
      totalAmount,
      createdAt: createdAt.toISOString(),
    })
    orderSeq++
  }

  let ordersCreated = 0
  await runInBatches(orderSpecs, async (spec) => {
    await payload.create({
      collection: 'orders',
      data: {
        orderNumber: spec.orderNumber,
        customerName: 'Walk-in Customer',
        customerPhone: 'N/A',
        orderType: 'In-Store',
        items: spec.items,
        totalAmount: spec.totalAmount,
        paymentMethod: 'Cash',
        status: 'Completed',
        createdAt: spec.createdAt,
        updatedAt: spec.createdAt,
      },
    })
    ordersCreated++
  })
  console.log(`Created ${ordersCreated} orders.`)

  // --- Apply final stock levels back to products ---
  const stockUpdates = products.filter((p) => (remainingStock.get(p.id) ?? p.stockQuantity) !== p.stockQuantity)
  await runInBatches(stockUpdates, (p) =>
    payload.update({
      collection: 'products',
      id: p.id,
      data: { stockQuantity: remainingStock.get(p.id) ?? p.stockQuantity },
    }),
  )
  console.log('Applied stock decrements from simulated sales.')

  const outOfStockCount = products.filter((p) => (remainingStock.get(p.id) ?? 0) <= 0).length
  const lowStockCount = products.filter((p) => {
    const stock = remainingStock.get(p.id) ?? 0
    return stock > 0 && stock <= 5
  }).length
  console.log(`Seed window: Sep 1, 2026 - ${TODAY.toDateString()}`)
  console.log(`Stock state: ${outOfStockCount} out of stock, ${lowStockCount} low stock (<=5).`)
  console.log('Seed complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
