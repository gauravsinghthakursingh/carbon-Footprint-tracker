import { ActionPreset, CalculatorData } from "./types";

export const DEFAULT_CALCULATOR_VALUES: CalculatorData = {
  carMiles: 150,
  carType: "gas",
  transitMiles: 15,
  flightsCount: 2,
  dietType: "balanced",
  electricityBill: 120,
  cleanGrid: "no",
  heatingType: "gas",
  wasteGeneration: "moderate",
  compost: "no",
};

export const ECO_ACTION_PRESETS: ActionPreset[] = [
  // Transport presets
  {
    id: "t_bike",
    title: "Bike or walk instead of drive",
    category: "Transport",
    kgSaved: 2.2,
    description: "Replaces a typical 5-mile local car trip with carbon-free active travel.",
  },
  {
    id: "t_transit",
    title: "Take public transit instead of solo car driving",
    category: "Transport",
    kgSaved: 4.1,
    description: "Commute via subway, bus, or train rather than an internal combustion car (approx 10 miles).",
  },
  {
    id: "t_carpool",
    title: "Carpool to work or social events",
    category: "Transport",
    kgSaved: 2.0,
    description: "Share a ride with one or more people, dividing the carbon impact directly.",
  },
  
  // Diet presets
  {
    id: "d_vegan_day",
    title: "Eat a meat-free, plant-based lunch/dinner",
    category: "Diet",
    kgSaved: 1.8,
    description: "Slashes resource load by substituting beef or chicken with high-quality plant proteins.",
  },
  {
    id: "d_dairy_swap",
    title: "Swap dairy milk with oat/almond milk",
    category: "Diet",
    kgSaved: 0.6,
    description: "Plant milks generate upward of 70% fewer emissions and land use than dairy.",
  },
  {
    id: "d_zero_waste",
    title: "Prevent kitchen food waste",
    category: "Diet",
    kgSaved: 0.9,
    description: "Ensure leftovers are plan-frozen or eaten, halting the decay of high-energy organic wastes.",
  },

  // Home presets
  {
    id: "h_temp_tune",
    title: "Adjust thermostat down 1°C / 2°F",
    category: "Home",
    kgSaved: 0.8,
    description: "Lower heating (or raise cooling air-con limit) to decrease home energy draw dramatically.",
  },
  {
    id: "h_line_dry",
    title: "Line dry a load of laundry",
    category: "Home",
    kgSaved: 0.6,
    description: "Skip the heavy heating coil cycle of the spin clothes dryer entirely.",
  },
  {
    id: "h_cold_wash",
    title: "Wash clothes in cold cycle only",
    category: "Home",
    kgSaved: 0.4,
    description: "Up to 90% of washing machine energy is consumed solely by heating process water.",
  },
  {
    id: "h_vampire_draw",
    title: "Unplug standby vampire devices",
    category: "Home",
    kgSaved: 0.3,
    description: "Turn off power strips and charger blocks that consume trickle power overnight.",
  },

  // Waste presets
  {
    id: "w_compost",
    title: "Compost kitchen organic scraps",
    category: "Waste",
    kgSaved: 1.2,
    description: "Permits decomposition with oxygen (aerobic), eliminating anaerobic landfill methane gas leakage.",
  },
  {
    id: "w_reusable",
    title: "Reject single-use shopping bags and cups",
    category: "Waste",
    kgSaved: 0.2,
    description: "Prevents direct fossil refine, delivery, and microplastic disposal cycles.",
  },
  {
    id: "w_thrift",
    title: "Buy thrift/used or repair a domestic item",
    category: "Waste",
    kgSaved: 3.5,
    description: "Disrupts the entire resource-extracting, manufacturing, and cargo-shipping pathway.",
  },
];
