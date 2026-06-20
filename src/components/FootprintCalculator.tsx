import React, { useState } from "react";
import { Car, Home, Flame, Utensils, Award, Sprout, Footprints, Info, Plane } from "lucide-react";
import { CalculatorData } from "../types";

interface CalculatorProps {
  data: CalculatorData;
  onChange: (newData: CalculatorData) => void;
}

export default function FootprintCalculator({ data, onChange }: CalculatorProps) {
  const [activeTab, setActiveTab] = useState<"transport" | "utilities" | "diet-waste">("transport");

  const updateField = (field: keyof CalculatorData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // Live footprint model calculations for frontend responsive state (Annual Metric Tons CO2e)
  const carMiles = Number(data.carMiles);
  const carTypeMultiplier = data.carType === "hybrid" ? 0.2 : data.carType === "ev" ? 0.08 : data.carType === "none" ? 0 : 0.42; 
  const annualTransportCar = (carMiles * 52 * carTypeMultiplier) / 2204.62;

  const transitMiles = Number(data.transitMiles);
  const annualTransportTransit = (transitMiles * 52 * 0.12) / 2204.62;

  const flights = Number(data.flightsCount);
  const annualTransportFlights = (flights * 600) / 2204.62;

  const electricBill = Number(data.electricityBill);
  const gridMultiplier = data.cleanGrid === "yes" ? 0.08 : 0.82;
  const annualHomeElectric = (electricBill * 12 * gridMultiplier) / 2204.62;

  let heatingTons = 1.2;
  if (data.heatingType === "electric") heatingTons = data.cleanGrid === "yes" ? 0.25 : 0.75;
  if (data.heatingType === "other") heatingTons = 0.55;

  let dietTons = 2.4; 
  if (data.dietType === "balanced") dietTons = 1.7;
  if (data.dietType === "vegetarian") dietTons = 1.1;
  if (data.dietType === "vegan") dietTons = 0.7;

  let wasteTons = 0.6;
  if (data.wasteGeneration === "moderate") wasteTons = 0.4;
  if (data.wasteGeneration === "low") wasteTons = 0.25;
  if (data.compost === "yes") wasteTons *= 0.7;

  const totalCO2Tons = annualTransportCar + annualTransportTransit + annualTransportFlights + annualHomeElectric + heatingTons + dietTons + wasteTons;

  return (
    <section className="bg-white border border-[#E6E6DF] rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col h-full" id="carbon-calculator">
      {/* Tab Header with Live Impact Number */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#E6E6DF]">
        <div>
          <h2 className="text-xl font-serif italic font-bold tracking-tight text-[#5A5A40] flex items-center gap-2">
            <Footprints className="w-5 h-5" />
            1. Carbon Assessment
          </h2>
          <p className="text-xs text-[#8C8C70] mt-1 font-sans">Slide or toggle your baseline consumption details below</p>
        </div>
        <div className="text-right bg-[#F5F5F0] border border-[#E6E6DF] px-4 py-2 rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-wider text-[#8C8C70]">Annual Carbon Burden</p>
          <p className="text-2xl font-serif italic font-bold text-[#5A5A40]" id="live-total-metric">
            {totalCO2Tons.toFixed(2)} <span className="text-[10px] font-sans text-[#8C8C70] font-normal">tons CO₂e / yr</span>
          </p>
        </div>
      </div>

      {/* Modern Natural Navigation Tabs */}
      <div className="flex bg-[#F5F5F0] p-1.5 rounded-2xl gap-1 mb-6 border border-[#E6E6DF]" id="calculator-tabs">
        <button
          onClick={() => setActiveTab("transport")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "transport"
              ? "bg-[#5A5A40] text-white shadow-sm"
              : "text-[#8C8C70] hover:text-[#5A5A40] hover:bg-white/50"
          }`}
          id="tab-transport"
        >
          <Car className="w-3.5 h-3.5" />
          Transport
        </button>
        <button
          onClick={() => setActiveTab("utilities")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "utilities"
              ? "bg-[#5A5A40] text-white shadow-sm"
              : "text-[#8C8C70] hover:text-[#5A5A40] hover:bg-white/50"
          }`}
          id="tab-utilities"
        >
          <Home className="w-3.5 h-3.5" />
          Utilities
        </button>
        <button
          onClick={() => setActiveTab("diet-waste")}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === "diet-waste"
              ? "bg-[#5A5A40] text-white shadow-sm"
              : "text-[#8C8C70] hover:text-[#5A5A40] hover:bg-white/50"
          }`}
          id="tab-diet-waste"
        >
          <Utensils className="w-3.5 h-3.5" />
          Diet & Waste
        </button>
      </div>

      {/* Dynamic Tab Panels */}
      <div className="flex-grow space-y-6">
        {activeTab === "transport" && (
          <div className="space-y-6" id="panel-transport">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase font-bold tracking-widest text-[#8C8C70] flex items-center gap-1">
                  Car Mileage / Week
                </label>
                <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#F5F5F0] border border-[#E6E6DF] px-2.5 py-1 rounded-lg">
                  {data.carMiles} miles
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="10"
                value={data.carMiles}
                onChange={(e) => updateField("carMiles", Number(e.target.value))}
                className="w-full h-1.5 bg-[#E6E6DF] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
              />
              <div className="flex justify-between text-[10px] text-[#8C8C70] mt-1 font-mono">
                <span>0 mi (Car-free)</span>
                <span>250 mi (Average)</span>
                <span>500 mi (High commute)</span>
              </div>
            </div>

            {data.carMiles > 0 && (
              <div className="p-4 bg-[#F5F5F0] border border-[#E6E6DF] rounded-2xl">
                <label className="text-xs uppercase font-bold tracking-widest text-[#8C8C70] block mb-2.5">
                  Vehicle Powertrain
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["gas", "hybrid", "ev"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => updateField("carType", type)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                        data.carType === type
                          ? "border-[#5A5A40] text-[#5A5A40] bg-white shadow-sm font-extrabold"
                          : "border-[#E6E6DF] text-[#8C8C70] hover:border-[#8C8C70] bg-transparent"
                      }`}
                    >
                      {type === "gas" ? "Gasoline" : type === "hybrid" ? "Hybrid" : "EV / Electric"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase font-bold tracking-widest text-[#8C8C70]">
                  Public Transit / Week
                </label>
                <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#F5F5F0] border border-[#E6E6DF] px-2.5 py-1 rounded-lg">
                  {data.transitMiles} miles
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={data.transitMiles}
                onChange={(e) => updateField("transitMiles", Number(e.target.value))}
                className="w-full h-1.5 bg-[#E6E6DF] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
              />
              <div className="flex justify-between text-[10px] text-[#8C8C70] mt-1 font-mono">
                <span>0 mi</span>
                <span>100 mi (Regular commuter)</span>
                <span>200 mi</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase font-bold tracking-widest text-[#8C8C70] flex items-center gap-1">
                  Annual Flight Activity
                </label>
                <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#F5F5F0] border border-[#E6E6DF] px-2.5 py-1 rounded-lg">
                  {data.flightsCount} Round trips
                </span>
              </div>
              <div className="flex items-center gap-3 bg-[#F5F5F0] border border-[#E6E6DF] p-2.5 rounded-2xl">
                <button
                  onClick={() => updateField("flightsCount", Math.max(0, data.flightsCount - 1))}
                  className="w-9 h-9 border border-[#E6E6DF] hover:border-[#8C8C70] bg-white text-[#5A5A40] text-sm rounded-xl flex items-center justify-center font-bold transition-all shadow-xs"
                >
                  -
                </button>
                <div className="flex-1 text-center font-mono text-sm font-bold text-[#5A5A40]">
                  {data.flightsCount} Flight{data.flightsCount !== 1 ? "s" : ""} / yr
                </div>
                <button
                  onClick={() => updateField("flightsCount", Math.min(30, data.flightsCount + 1))}
                  className="w-9 h-9 border border-[#E6E6DF] hover:border-[#8C8C70] bg-white text-[#5A5A40] text-sm rounded-xl flex items-center justify-center font-bold transition-all shadow-xs"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "utilities" && (
          <div className="space-y-6" id="panel-utilities">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase font-bold tracking-widest text-[#8C8C70]">
                  Monthly Electric Expense ($)
                </label>
                <span className="text-xs font-mono font-bold text-[#5A5A40] bg-[#F5F5F0] border border-[#E6E6DF] px-2.5 py-1 rounded-lg">
                  ${data.electricityBill} / mo
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="400"
                step="10"
                value={data.electricityBill}
                onChange={(e) => updateField("electricityBill", Number(e.target.value))}
                className="w-full h-1.5 bg-[#E6E6DF] rounded-lg appearance-none cursor-pointer accent-[#5A5A40]"
              />
              <div className="flex justify-between text-[10px] text-[#8C8C70] mt-1 font-mono">
                <span>$0 (Self-sufficient)</span>
                <span>$200</span>
                <span>$400 (Heavy usage)</span>
              </div>
            </div>

            <div className="p-4 bg-[#F5F5F0] border border-[#E6E6DF] rounded-2xl space-y-3">
              <div>
                <label className="text-xs uppercase font-bold tracking-widest text-[#5A5A40] block font-sans">
                  Clean / Renewable Energy Program
                </label>
                <span className="text-[11px] text-[#8C8C70] block mt-0.5 leading-normal">
                  Are you signed up for community solar, wind premiums, or passive storage?
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateField("cleanGrid", "yes")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    data.cleanGrid === "yes"
                      ? "border-[#5A5A40] text-[#5A5A40] bg-white shadow-xs font-extrabold"
                      : "border-[#E6E6DF] text-[#8C8C70] hover:border-[#8C8C70] bg-transparent"
                  }`}
                >
                  Yes, clean wind/solar
                </button>
                <button
                  onClick={() => updateField("cleanGrid", "no")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    data.cleanGrid === "no"
                      ? "border-[#5A5A40] text-[#5A5A40] bg-white shadow-xs font-extrabold"
                      : "border-[#E6E6DF] text-[#8C8C70] hover:border-[#8C8C70] bg-transparent"
                  }`}
                >
                  No, standard grid mix
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase font-bold tracking-widest text-[#8C8C70] block mb-2">
                Primary Thermal Heating Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["gas", "electric", "other"] as const).map((source) => (
                  <button
                    key={source}
                    onClick={() => updateField("heatingType", source)}
                    className={`py-2.5 px-1 text-xs font-bold rounded-xl border transition-all capitalize ${
                      data.heatingType === source
                        ? "border-[#5A5A40] text-[#5A5A40] bg-[#F5F5F0] font-extrabold"
                        : "border-[#E6E6DF] text-[#8C8C70] hover:border-[#8C8C70]"
                    }`}
                  >
                    {source === "gas" ? "Natural Gas" : source === "electric" ? "Heat Pump / Elec" : "Biomass / wood"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "diet-waste" && (
          <div className="space-y-6" id="panel-diet-waste">
            <div>
              <label className="text-xs uppercase font-bold tracking-widest text-[#8C8C70] block mb-2">
                Dietary Pattern
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["meat-heavy", "balanced", "vegetarian", "vegan"] as const).map((diet) => (
                  <button
                    key={diet}
                    onClick={() => updateField("dietType", diet)}
                    className={`p-3 text-left rounded-2xl border transition-all ${
                      data.dietType === diet
                        ? "border-[#5A5A40] text-[#5A5A40] bg-[#F5F5F0]/60 ring-1 ring-[#5A5A40]/30"
                        : "border-[#E6E6DF] text-[#8C8C70] hover:border-[#8C8C70]"
                    }`}
                  >
                    <p className="text-xs font-bold capitalize flex items-center gap-1.5">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${diet === "vegan" ? "bg-[#5A5A40]" : diet === "vegetarian" ? "bg-[#D8D8C0]" : "bg-orange-300"}`} />
                      {diet === "meat-heavy" ? "Meat Intensive" : diet === "balanced" ? "Balanced diet" : diet === "vegetarian" ? "Vegetarian" : "Vegan"}
                    </p>
                    <p className="text-[10px] text-[#8C8C70] mt-1.5 leading-relaxed">
                      {diet === "meat-heavy" && "Daily red meats, pork, dairy averages: ~2.4t CO2e."}
                      {diet === "balanced" && "Moderate beef, regular fish, chicken: ~1.7t CO2e."}
                      {diet === "vegetarian" && "No direct carcass meats, soy/tofu, eggs: ~1.1t CO2e."}
                      {diet === "vegan" && "Grains, lentils, zero dairy/animal proteins: ~0.7t CO2e."}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#F5F5F0] border border-[#E6E6DF] rounded-2xl">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C8C70] block mb-2">
                  Waste Level
                </label>
                <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-[#E6E6DF]">
                  {(["high", "moderate", "low"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => updateField("wasteGeneration", level)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg capitalize transition-all ${
                        data.wasteGeneration === level
                          ? "bg-[#5A5A40] text-white shadow-xs"
                          : "text-[#8C8C70] hover:text-[#5A5A40]"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-[#8C8C70] block mb-2">
                  Active Organic Composting?
                </label>
                <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-[#E6E6DF]">
                  <button
                    onClick={() => updateField("compost", "yes")}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      data.compost === "yes"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#8C8C70] hover:text-[#5A5A40]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => updateField("compost", "no")}
                    className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      data.compost === "no"
                        ? "bg-[#5A5A40] text-white shadow-xs"
                        : "text-[#8C8C70] hover:text-[#5A5A40]"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTPRINT RELATIVE BENCHMARK (Aesthetics Matching Design Example) */}
      <div className="mt-8 pt-5 border-t border-[#E6E6DF]" id="footprint-benchmarks">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C8C70]">Emission Benchmarks</span>
          <span className="text-[9px] text-[#8C8C70] font-medium font-mono">Tons CO₂e / year</span>
        </div>
        <div className="relative h-2.5 bg-[#F5F5F0] border border-[#E6E6DF] rounded-full mb-3 overflow-hidden">
          {/* Target marker (2.0 Tons) */}
          <div 
            className="absolute top-0 bottom-0 left-[12%] w-[3px] bg-[#5A5A40] z-10"
            title="World Climate Neutral Target: 2.0t"
          />
          {/* Global Average (4.8 Tons) */}
          <div 
            className="absolute top-0 bottom-0 left-[30%] w-[1.5px] bg-[#8C8C70] z-10"
            title="Global Average: 4.8t"
          />
          {/* US Average (16.0 Tons) */}
          <div 
            className="absolute top-0 bottom-0 left-[82%] w-[1.5px] bg-[#3a3a2f]/40 z-10"
            title="Typical US Average: 16t"
          />

          {/* User value filling */}
          <div
            className="absolute top-0 bottom-0 left-0 transition-all duration-500 rounded-full bg-[#D8D8C0]/85"
            style={{ width: `${Math.min(100, (totalCO2Tons / 18) * 100)}%` }}
          />
        </div>

        <div className="grid grid-cols-4 text-[9px] font-bold text-[#8C8C70] font-mono tracking-tight text-center">
          <div className="text-left text-[#5A5A40] flex items-center gap-1 font-extrabold">
            <span className="inline-block w-2 h-2 bg-[#D8D8C0] rounded-full border border-[#5A5A40]" />
            You: {totalCO2Tons.toFixed(1)}t
          </div>
          <div>
            Target: 2.0t
          </div>
          <div>
            Glob Avg: 4.8t
          </div>
          <div className="text-right">
            US Avg: 16t
          </div>
        </div>
      </div>
    </section>
  );
}
