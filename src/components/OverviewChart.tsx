import React, { useState } from "react";
import { motion } from "motion/react";
import { CalculatorData } from "../types";
import { TreePine, Car, Home, Utensils, Trash2, ShieldAlert, Sparkles, Sprout, Info, CheckCircle2, ChevronRight } from "lucide-react";

interface OverviewChartProps {
  data: CalculatorData;
}

interface NurseryPlot {
  id: number;
  title: string;
  category: "Transport" | "Home" | "Diet" | "Waste" | "General";
  detail: string;
  thresholdField: string;
  thresholdVal: any;
}

const NURSERY_TIPS: NurseryPlot[] = [
  { id: 1, title: "Commute Canopy", category: "Transport", detail: "Sprout this pine by keeping vehicle miles under 100 per week.", thresholdField: "carMiles", thresholdVal: 100 },
  { id: 2, title: "Electric Sapling", category: "Home", detail: "Sprout this pine by turning on clean energy utility options.", thresholdField: "cleanGrid", thresholdVal: "yes" },
  { id: 3, title: "Oat-Grove Sprout", category: "Diet", detail: "Sprout this pine by choosing vegetarian or vegan food options.", thresholdField: "dietType", thresholdVal: "vegetarian" },
  { id: 4, title: "Altitude Redwood", category: "Transport", detail: "Bloom this sequoia by making 1 or fewer plane trips per year.", thresholdField: "flightsCount", thresholdVal: 1 },
  { id: 5, title: "Compost Cedar", category: "Waste", detail: "Sprout this cedar by starting secondary food composting habits.", thresholdField: "compost", thresholdVal: "yes" },
  { id: 6, title: "Hybrid Sapling", category: "Transport", detail: "Grow this tree by opting for Hybrid, Electric or no vehicle type.", thresholdField: "carType", thresholdVal: "hybrid" },
  { id: 7, title: "Transit Fir", category: "Transport", detail: "Saturate this fir by logging public transit transit over 15 miles/wk.", thresholdField: "transitMiles", thresholdVal: 15 },
  { id: 8, title: "Eco-Lid Sprout", category: "Waste", detail: "Sprout this pine by generating moderate or low waste volumes.", thresholdField: "wasteGeneration", thresholdVal: "moderate" },
  { id: 9, title: "Eco Hero Sequoia", category: "General", detail: "Bloom this redwood by keeping your total carbon rate under 8.0 tons.", thresholdField: "grandTotal", thresholdVal: 8.0 },
  { id: 10, title: "Moderate Watt Cedar", category: "Home", detail: "Sprout this cedar by managing domestic electricity bills under $100.", thresholdField: "electricityBill", thresholdVal: 100 },
  { id: 11, title: "Non-Gas Maple", category: "Home", detail: "Water this maple by opting for electric or heat pump heating systems.", thresholdField: "heatingType", thresholdVal: "electric" },
  { id: 12, title: "Climate Vanguard Elm", category: "General", detail: "Grow this giant if your annual carbon score is pristine (under 5.0 tons).", thresholdField: "pristineScore", thresholdVal: 5.0 }
];

export default function OverviewChart({ data }: OverviewChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [selectedPlotId, setSelectedPlotId] = useState<number>(1);

  // Carbon breakdown calculations
  const carMiles = Number(data.carMiles);
  const carTypeMultiplier = data.carType === "hybrid" ? 0.2 : data.carType === "ev" ? 0.08 : data.carType === "none" ? 0 : 0.42; 
  const transportCar = (carMiles * 52 * carTypeMultiplier) / 2204.62;
  const transitMiles = Number(data.transitMiles);
  const transportTransit = (transitMiles * 52 * 0.12) / 2204.62;
  const flights = Number(data.flightsCount);
  const transportFlights = (flights * 600) / 2204.62;
  
  const totalTransport = parseFloat((transportCar + transportTransit + transportFlights).toFixed(2));

  const electricBill = Number(data.electricityBill);
  const gridMultiplier = data.cleanGrid === "yes" ? 0.08 : 0.82;
  const homeUtilityElectric = (electricBill * 12 * gridMultiplier) / 2204.62;
  
  let heatingTons = 1.2;
  if (data.heatingType === "electric") heatingTons = data.cleanGrid === "yes" ? 0.2 : 0.7;
  if (data.heatingType === "other") heatingTons = 0.5;
  
  const totalHome = parseFloat((homeUtilityElectric + heatingTons).toFixed(2));

  let dietTons = 2.4; 
  if (data.dietType === "balanced") dietTons = 1.7;
  if (data.dietType === "vegetarian") dietTons = 1.1;
  if (data.dietType === "vegan") dietTons = 0.7;
  
  const totalDiet = parseFloat(dietTons.toFixed(2));

  let wasteTons = 0.6;
  if (data.wasteGeneration === "moderate") wasteTons = 0.4;
  if (data.wasteGeneration === "low") wasteTons = 0.25;
  if (data.compost === "yes") wasteTons *= 0.7;
  
  const totalWaste = parseFloat(wasteTons.toFixed(2));

  const grandTotal = parseFloat((totalTransport + totalHome + totalDiet + totalWaste).toFixed(2));

  const segments = [
    { name: "Transportation", value: totalTransport, color: "#5A5A40", hoverColor: "#474732", icon: Car },
    { name: "Home Utilities", value: totalHome, color: "#8C8C70", hoverColor: "#74745B", icon: Home },
    { name: "Diet & Food", value: totalDiet, color: "#AEAEA0", hoverColor: "#939384", icon: Utensils },
    { name: "Waste Management", value: totalWaste, color: "#D8D8C0", hoverColor: "#C3C3A6", icon: Trash2 },
  ];

  // Helper values for dynamic donut visualization
  let accumulatedAngle = 0;
  const donutRadius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * donutRadius;

  // Evaluate state of nursery saplings
  const evaluatePlotActive = (plot: NurseryPlot) => {
    switch (plot.thresholdField) {
      case "carMiles":
        return data.carMiles <= plot.thresholdVal;
      case "cleanGrid":
        return data.cleanGrid === "yes";
      case "dietType":
        return data.dietType === "vegan" || data.dietType === "vegetarian";
      case "flightsCount":
        return data.flightsCount <= plot.thresholdVal;
      case "compost":
        return data.compost === "yes";
      case "carType":
        return data.carType === "hybrid" || data.carType === "ev" || data.carType === "none";
      case "transitMiles":
        return data.transitMiles >= plot.thresholdVal;
      case "wasteGeneration":
        return data.wasteGeneration === "low" || data.wasteGeneration === "moderate";
      case "electricityBill":
        return data.electricityBill <= plot.thresholdVal;
      case "heatingType":
        return data.heatingType === "electric" || data.heatingType === "other";
      case "grandTotal":
        return grandTotal <= plot.thresholdVal;
      case "pristineScore":
        return grandTotal <= plot.thresholdVal;
      default:
        return true;
    }
  };

  const activePlotsCount = NURSERY_TIPS.filter(evaluatePlotActive).length;
  const forestPercentage = Math.round((activePlotsCount / NURSERY_TIPS.length) * 100);

  const selectedPlot = NURSERY_TIPS.find(p => p.id === selectedPlotId) || NURSERY_TIPS[0];
  const isSelectedActive = evaluatePlotActive(selectedPlot);

  return (
    <div className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-8" id="impact-overview-chart">
      {/* Title & Static description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif italic text-xl text-[#5A5A40] font-bold">2. Habitat Proportions & Nursery</h3>
          <p className="text-xs text-[#8C8C70] mt-1">
            See your carbon balance and grow seedlings in the virtual natural refuge below
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F5F5F0] border border-[#E6E6DF] rounded-2xl px-3.5 py-1.5 self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-[#8C8C70]" />
          <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-wider">
            Nursery: {forestPercentage}% Wilded
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: SVG Donut chart & categories list (Take 5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-44 h-44 md:w-48 md:h-48 mb-6">
            <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
              {/* Backing Ring */}
              <circle cx="80" cy="80" r={donutRadius} fill="transparent" stroke="#F5F5F0" strokeWidth={strokeWidth + 2} />
              
              {grandTotal > 0 ? (
                segments.map((seg, i) => {
                  const percentage = seg.value / grandTotal;
                  const strokeLength = percentage * circumference;
                  const strokeOffset = circumference - strokeLength + accumulatedAngle;
                  accumulatedAngle -= strokeLength;
                  
                  const isHovered = hoveredSegment === seg.name;

                  return (
                    <motion.circle
                      key={seg.name}
                      cx="80"
                      cy="80"
                      r={donutRadius}
                      fill="transparent"
                      stroke={isHovered ? seg.hoverColor : seg.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSegment(seg.name)}
                      onMouseLeave={() => setHoveredSegment(null)}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: strokeOffset }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  );
                })
              ) : (
                <circle cx="80" cy="80" r={donutRadius} fill="transparent" stroke="#E6E6DF" strokeWidth={strokeWidth} strokeDasharray="3 3" />
              )}
            </svg>

            {/* Inner dynamic content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              {hoveredSegment ? (
                (() => {
                  const activeSeg = segments.find(s => s.name === hoveredSegment);
                  const activePercent = activeSeg ? (activeSeg.value / (grandTotal || 1)) * 100 : 0;
                  return (
                    <>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#8C8C70] truncate max-w-[120px]">{hoveredSegment}</span>
                      <span className="text-2xl font-mono font-bold text-[#3A3A2F]" id="focus-metric-tons">
                        {activeSeg?.value.toFixed(1)}t
                      </span>
                      <span className="text-[9px] text-[#5A5A40] font-sans font-semibold">{Math.round(activePercent)}% share</span>
                    </>
                  );
                })()
              ) : (
                <>
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#8C8C70]">Annual Total</span>
                  <span className="text-3xl font-serif italic text-[#5A5A40] font-bold" id="center-metric-tons">
                    {grandTotal.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans tracking-wide">tons CO₂e</span>
                </>
              )}
            </div>
          </div>

          {/* Symmetrical mini key legends underneath the donut */}
          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            {segments.map((seg) => {
              const pct = grandTotal > 0 ? (seg.value / grandTotal) * 100 : 0;
              return (
                <div 
                  key={seg.name}
                  className="flex flex-col p-2 bg-[#F5F5F0]/50 border border-slate-100 rounded-xl"
                  onMouseEnter={() => setHoveredSegment(seg.name)}
                  onMouseLeave={() => setHoveredSegment(null)}
                >
                  <span className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    {seg.name.split(" ")[0]}
                  </span>
                  <span className="text-xs font-mono font-semibold text-[#5A5A40] mt-0.5">{seg.value.toFixed(1)}t</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Virtual Interactive Nursery Grid System (Take 7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4" id="nursery-grid-system">
          <div className="border border-[#E6E6DF] bg-[#F5F5F0]/40 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C8C70]">Interactive Forest Sandbox</span>
                <h4 className="text-sm font-semibold text-[#5A5A40] font-serif italic">Tree Nurseries ({activePlotsCount}/12 Healthy)</h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-[#5A5A40] bg-white border border-[#E6E6DF] px-2 py-0.5 rounded-md">
                  {(18 - grandTotal > 0 ? (18 - grandTotal) * 50 : 0).toFixed(0)} seedling offset potential
                </span>
              </div>
            </div>

            {/* Interactive Plots 4x3 Grid */}
            <div className="grid grid-cols-4 gap-2.5">
              {NURSERY_TIPS.map((plot) => {
                const isActive = evaluatePlotActive(plot);
                const isSelected = selectedPlotId === plot.id;
                
                return (
                  <motion.button
                    key={plot.id}
                    onClick={() => setSelectedPlotId(plot.id)}
                    className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center pt-2 pb-1.5 transition-all outline-none ${
                      isSelected 
                        ? "border-[#5A5A40] p-1 bg-white ring-2 ring-[#5A5A40]/10" 
                        : "border-[#E6E6DF] bg-white/70 hover:bg-white"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Glowing active tree, or thirsty leaf */}
                    {isActive ? (
                      <div className="relative flex flex-col items-center">
                        <TreePine className="w-6 h-6 text-emerald-700" />
                        <motion.div
                          className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full -z-10"
                          animate={{ scale: [0.8, 1.2, 0.8] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <span className="text-[7.5px] uppercase font-bold text-emerald-800 tracking-tighter mt-1">Grown</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center opacity-65 grayscale">
                        <Sprout className="w-5 h-5 text-amber-700 animate-pulse" />
                        <span className="text-[7.5px] font-mono text-[#8C8C70] tracking-tighter mt-1.5">Muted</span>
                      </div>
                    )}
                    
                    {/* Plot coordinates stamp */}
                    <span className="absolute top-1 left-1.5 font-mono text-[7px] text-[#8C8C70]">#{plot.id}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Live HUD feedback on selected Plot instructions */}
          <motion.div 
            key={selectedPlotId}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
              isSelectedActive 
                ? "bg-emerald-50/40 border-emerald-200/60" 
                : "bg-amber-50/30 border-amber-200/50"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[9px] uppercase font-bold rounded-md ${
                  isSelectedActive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedPlot.category}
                </span>
                <h5 className="text-xs font-bold text-slate-800 font-serif italic">{selectedPlot.title} ({isSelectedActive ? "Sprouted!" : "Thirsty"})</h5>
              </div>
              <p className="text-xs text-[#5A5A40] leading-relaxed">
                {selectedPlot.detail}
              </p>
            </div>

            <div className={`text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 self-stretch justify-center md:self-auto ${
              isSelectedActive ? "bg-emerald-100/50 text-emerald-800 border border-emerald-200" : "bg-amber-100/40 text-amber-800 border border-amber-200"
            }`}>
              {isSelectedActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Eco Parameter Active
                </>
              ) : (
                <>
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  Pending Alignment
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sustainable score helper text */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3 bg-[#F5F5F0]/60 p-4 rounded-2xl border border-[#E6E6DF]/60">
        <div className="w-9 h-9 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-xs shrink-0 text-emerald-700">
          <TreePine className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-xs text-[#3A3A2F]/80 leading-relaxed font-sans">
          Did you know? Carbon offset mapping matches your configurations directly! Toggle sliders under <strong>Transport</strong>, <strong>Utilities</strong> or <strong>Diet & Waste</strong> and watch your forest seeds transform with spring freshness.
        </p>
      </div>
    </div>
  );
}
