import React, { useState } from "react";
import { CalculatorData } from "../types";
import { TreePine, Car, Home, Utensils, Trash2, ShieldAlert, Sparkles } from "lucide-react";

interface OverviewChartProps {
  data: CalculatorData;
}

export default function OverviewChart({ data }: OverviewChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

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

  return (
    <div className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col justify-between h-full" id="impact-overview-chart">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif-vintage italic text-xl text-[#5A5A40] font-bold">Footprint Allocation</h3>
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C8C70]">Current Year Rate</span>
        </div>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Carbon intensive areas shown proportionally. Hover over the pie segments or click options below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-grow">
        {/* Core SVG Donut Section */}
        <div className="col-span-1 md:col-span-6 flex justify-center relative">
          <div className="relative w-48 h-48 md:w-52 md:h-52">
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
                    <circle
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
                      title={`${seg.name}: ${seg.value} tons (${Math.round(percentage * 100)}%)`}
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
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#8C8C70]">{hoveredSegment}</span>
                      <span className="text-2xl font-mono font-bold text-[#3A3A2F]" id="focus-metric-tons">
                        {activeSeg?.value.toFixed(1)}t
                      </span>
                      <span className="text-[10px] text-[#5A5A40] font-sans font-semibold">{Math.round(activePercent)}% share</span>
                    </>
                  );
                })()
              ) : (
                <>
                  <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#8C8C70]">Annual Total</span>
                  <span className="text-3xl font-serif-vintage italic text-[#5A5A40] font-bold" id="center-metric-tons">
                    {grandTotal.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans tracking-wide">tons CO₂e</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Categories Breakdown Legend List */}
        <div className="col-span-1 md:col-span-6 space-y-3.5">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const pct = grandTotal > 0 ? (seg.value / grandTotal) * 100 : 0;
            const isHovered = hoveredSegment === seg.name;

            return (
              <div
                key={seg.name}
                onMouseEnter={() => setHoveredSegment(seg.name)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`p-3 rounded-2xl transition-all duration-200 border cursor-pointer ${
                  isHovered 
                    ? "bg-[#F5F5F0] border-[#D8D8C0] translate-x-1" 
                    : "bg-slate-50/50 border-transparent hover:bg-slate-50"
                }`}
                id={`legend-${seg.name.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs font-bold text-slate-700">{seg.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {seg.value.toFixed(1)} tons
                  </span>
                </div>
                
                {/* Visual tiny progress bar */}
                <div className="relative h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-300" 
                    style={{ 
                      width: `${pct}%`,
                      backgroundColor: seg.color 
                    }}
                  />
                </div>
                
                <div className="flex justify-between text-[9px] text-[#8C8C70] mt-1 font-sans">
                  <span>{Math.round(pct)}% of total</span>
                  {seg.value > 2.0 && (
                    <span className="text-amber-700 flex items-center gap-0.5 font-bold uppercase tracking-tight">
                      <ShieldAlert className="w-3 h-3 text-amber-500 inline" />
                      Priority Offset target
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sustainability score helper text */}
      <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center gap-3 bg-[#F5F5F0]/60 p-3.5 rounded-2xl border border-[#E6E6DF]/60">
        <div className="w-9 h-9 bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-xs shrink-0 text-emerald-700">
          <TreePine className="w-5 h-5" />
        </div>
        <p className="text-xs text-[#3A3A2F]/80 leading-relaxed font-sans">
          Did you know? Every 1,000 kg (1 ton) you avoid is equivalent to planting <strong>50 new urban tree seedlings</strong> and letting them mature for 10 full years. Small dials, colossal change!
        </p>
      </div>
    </div>
  );
}
