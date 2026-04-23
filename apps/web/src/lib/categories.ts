import type { Category } from "@/types";

export interface CategoryMeta {
  id: Category;
  label: string;
  emoji: string;
  description: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  transport: {
    id: "transport",
    label: "Transport",
    emoji: "\u{1F697}", // car
    description: "Rides, carpools, moving help",
  },
  food: {
    id: "food",
    label: "Food",
    emoji: "\u{1F35E}", // bread
    description: "Meals, groceries, cooking",
  },
  childcare: {
    id: "childcare",
    label: "Childcare",
    emoji: "\u{1F9F8}", // teddy bear
    description: "Babysitting, school pickups, kid help",
  },
  skilled_labor: {
    id: "skilled_labor",
    label: "Skilled labor",
    emoji: "\u{1F527}", // wrench
    description: "Repairs, trades, hands-on work",
  },
  emotional_support: {
    id: "emotional_support",
    label: "Emotional support",
    emoji: "\u{1FAC2}", // people hugging
    description: "Listening, company, care",
  },
  education: {
    id: "education",
    label: "Education",
    emoji: "\u{1F4DA}", // books
    description: "Tutoring, teaching, mentoring",
  },
  housing: {
    id: "housing",
    label: "Housing",
    emoji: "\u{1F3E0}", // house
    description: "Shelter, moving, household help",
  },
  tech: {
    id: "tech",
    label: "Tech",
    emoji: "\u{1F4BB}", // laptop
    description: "Computers, phones, setup help",
  },
  other: {
    id: "other",
    label: "Other",
    emoji: "\u{1F33F}", // herb
    description: "Anything else our community needs",
  },
};

export const ALL_CATEGORIES: Category[] = Object.keys(
  CATEGORY_META,
) as Category[];
