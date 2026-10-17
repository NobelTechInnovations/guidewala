/**
 * Dekho Rajasthan content — the single source for the static page
 * (./page.tsx) and the DB seed (scripts/seed-dekho-rajasthan.ts), so the two
 * can't drift. Plain data only: no JSX, no server imports.
 */
import type { IncludeOption, MealOption } from "@/lib/packages";

export interface ItineraryDay {
  day: number;
  title: string;
  /** Drive leg, e.g. "150 km · 3 hrs drive". */
  transit?: string;
  desc: string;
  /**
   * Meals served that day. The package includes breakfast, lunch and dinner
   * (see INCLUSIONS), so every day carries all three except the arrival day
   * (no breakfast: the day text starts at hotel check-in) and the last day
   * (the tour ends at the Jaipur drop point after lunch). Seed-only: the
   * static page doesn't render it.
   */
  meals: MealOption[];
  /** Where the night is spent; a ROUTE stop name. Blank on the last day. Seed-only. */
  stay: string;
}

export const ROUTE = ["Jaipur", "Pushkar", "Jaisalmer", "Desert Camp", "Jodhpur", "Udaipur", "Chittorgarh"];

export const ITINERARY: ItineraryDay[] = [
  {
    day: 1,
    title: "Jaipur",
    desc: "Check in and lunch at hotel. Start half day sightseeing of Amber Fort, Birla Mandir, drive past Jal Mahal. Dinner and overnight stay at hotel.",
    meals: ["Lunch", "Dinner"],
    stay: "Jaipur",
  },
  {
    day: 2,
    title: "Jaipur → Pushkar",
    transit: "150 km · 3 hrs drive",
    desc: "Breakfast, then half-day Jaipur sightseeing — City Palace, Jantar Mantar, Albert Hall, driving past Hawa Mahal. After lunch, leave for Pushkar to visit Brahma Ji Temple and the holy lake. Dinner and overnight at hotel.",
    meals: ["Breakfast", "Lunch", "Dinner"],
    stay: "Pushkar",
  },
  {
    day: 3,
    title: "Pushkar → Jaisalmer",
    transit: "400 km · 7–8 hrs drive",
    desc: "Breakfast, then depart to Jaisalmer by road with lunch en route. Arrive, check in, dinner, and overnight stay at hotel.",
    meals: ["Breakfast", "Lunch", "Dinner"],
    stay: "Jaisalmer",
  },
  {
    day: 4,
    title: "Jaisalmer & Desert Camp",
    transit: "50 km · 1 hr drive",
    desc: "Full-day Jaisalmer sightseeing — Gadisar Lake, a walk through Jaisalmer Fort and the old city streets, Patwa Ki Haveli, and the Bada Bagh royal cenotaphs. After lunch, drive to Sam Sand Dunes via the ruins of Kuldhara village. Evening camel safari, sunset over the dunes, and a folk dance dinner around the campfire. Overnight at the desert camp.",
    meals: ["Breakfast", "Lunch", "Dinner"],
    stay: "Desert Camp",
  },
  {
    day: 5,
    title: "Desert Camp → Jodhpur",
    transit: "350 km · 5–6 hrs drive",
    desc: "Breakfast, then departure to Jodhpur. Sightseeing at Mehrangarh Fort, Jaswant Thada, Umaid Bhawan Museum, and a walk through the Clock Tower bazaar. Dinner and overnight stay at hotel.",
    meals: ["Breakfast", "Lunch", "Dinner"],
    stay: "Jodhpur",
  },
  {
    day: 6,
    title: "Jodhpur → Udaipur",
    transit: "300 km · 5–6 hrs drive",
    desc: "Breakfast, then departure to Udaipur via the Ranakpur Jain temples (lunch at Ranakpur). Arrive Udaipur, visit Fateh Sagar Lake. Dinner and overnight stay at hotel.",
    meals: ["Breakfast", "Lunch", "Dinner"],
    stay: "Udaipur",
  },
  {
    day: 7,
    title: "Udaipur",
    desc: "Full-day Udaipur sightseeing — Jagdish Temple, City Palace Museum, a view of Lake Pichola, Saheliyon Ki Bari, Lok Kala Museum, and the Shilpgram complex, plus a local craft centre visit. Dinner and overnight stay at hotel.",
    meals: ["Breakfast", "Lunch", "Dinner"],
    stay: "Udaipur",
  },
  {
    day: 8,
    title: "Udaipur → Jaipur",
    transit: "420 km · 7–8 hrs drive",
    desc: "Breakfast, then departure to Jaipur, stopping en route at Chittorgarh Fort for a visit and lunch. Continue to Jaipur city drop point. Tour ends.",
    meals: ["Breakfast", "Lunch"],
    stay: "",
  },
];

/** ROUTE with nights per stop, counted from the itinerary's overnight stays (a stop with none gets 0). */
export const ROUTE_STOPS = ROUTE.map((city) => ({
  CITY: city,
  NIGHTS: ITINERARY.filter((d) => d.stay === city).length,
}));

export const INCLUSIONS = [
  "3 Star Hotels",
  "Twin Sharing Rooms",
  "Breakfast, Lunch & Dinner",
  "Guided Sightseeing Tours",
  "Monument Entry Fees",
  "AC Transportation (Crysta / Coach)",
  "Accompanied Govt. Approved Guide",
  "Jeep Ride at Amber Fort",
  "Camel Safari at Sam Sand Dunes",
  "Cultural Entertainment at Desert Camp",
  "Boat Ride in Udaipur",
  "Laundry — 8 Items per Person",
];

export const PRICING = [
  { size: "2 Persons", price: 62500 },
  { size: "4 Persons", price: 54500 },
  { size: "5+ Persons", price: 45000 },
];

// --- Seed-only: the static page doesn't render these, the DB package page does. ---

/** The "Tour includes" icons that INCLUSIONS above cover (hotels, meals, AC transport, sightseeing, guide). */
export const INCLUDES: IncludeOption[] = ["Hotel", "Meals", "Transport", "Sightseeing", "Guide"];

/** Picked from the day-by-day text and the inclusions above. */
export const HIGHLIGHTS = [
  "Accompanied throughout by a government-approved guide",
  "Amber Fort with a jeep ride, plus City Palace and Jantar Mantar in Jaipur",
  "Brahma Ji Temple and the holy lake at Pushkar",
  "Jaisalmer Fort, Patwa Ki Haveli and Gadisar Lake",
  "Camel safari and sunset over the Sam Sand Dunes",
  "Folk dance dinner around the campfire at the desert camp",
  "Mehrangarh Fort and Jaswant Thada in Jodhpur",
  "Ranakpur Jain temples on the way to Udaipur",
  "Boat ride, City Palace Museum and Lake Pichola in Udaipur",
  "Chittorgarh Fort visit on the drive back to Jaipur",
];

/** The page's "+ 5% GST as applicable" pricing footnote: the fares are quoted before GST. */
export const EXCLUSIONS = ["5% GST (charged extra, as applicable)"];

/** The page's group-pricing card, so the per-group-size fares aren't lost when the card is retired. */
export const NOTES = [
  `Special group pricing per person: ${PRICING.map((p) => `${p.size} ₹${p.price.toLocaleString("en-IN")}`).join(", ")}.`,
];
