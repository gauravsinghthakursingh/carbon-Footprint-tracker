export interface CalculatorData {
  carMiles: number;
  carType: "gas" | "hybrid" | "ev" | "none";
  transitMiles: number;
  flightsCount: number;
  dietType: "meat-heavy" | "balanced" | "vegetarian" | "vegan";
  electricityBill: number;
  cleanGrid: "yes" | "no";
  heatingType: "gas" | "electric" | "other";
  wasteGeneration: "high" | "moderate" | "low";
  compost: "yes" | "no";
}

export interface LoggedAction {
  id: string;
  title: string;
  category: "Transport" | "Diet" | "Home" | "Waste";
  kgSaved: number;
  timestamp: string;
  isCustom?: boolean;
}

export interface ActionPreset {
  id: string;
  title: string;
  category: "Transport" | "Diet" | "Home" | "Waste";
  kgSaved: number;
  description: string;
}

export interface HighImpactRecommendation {
  title: string;
  category: "Transport" | "Diet" | "Home" | "Waste";
  estimatedSavings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  rationale: string;
}

export interface InsightResult {
  summary: string;
  annualFootprintEstimate: number;
  personalizedImpactScore: number;
  highImpactActions: HighImpactRecommendation[];
  personalizedMessage: string;
  isFallback?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl: string;
  points: number;
  level: string;
}

