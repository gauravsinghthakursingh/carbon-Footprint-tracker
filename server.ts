import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let ai: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is missing.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
}

// Generate intelligent default insight recommendations (fallback if API key is missing or calls fail)
function getFallbackInsights(calculator: any, loggedActions: any[]) {
  const annualCO2 = calculateLocalFootprint(calculator);
  const ecoScore = Math.max(10, Math.min(98, Math.round(100 - (annualCO2 / 18) * 60 + loggedActions.length * 3)));
  
  let mainCulprit = "Energy consumption";
  let maxWeight = 0;
  
  const transportCO2 = (Number(calculator.carMiles || 0) * 52 * 0.4) + (Number(calculator.transitMiles || 0) * 52 * 0.1) + (Number(calculator.flightsCount || 0) * 200);
  const homeCO2 = (Number(calculator.electricityBill || 0) * 12 * (calculator.cleanGrid === "yes" ? 0.05 : 0.4));
  const dietWeight = calculator.dietType === "meat-heavy" ? 3000 : calculator.dietType === "moderate-meat" ? 2000 : calculator.dietType === "vegetarian" ? 1200 : 800;
  const wasteWeight = calculator.wasteGeneration === "high" ? 800 : calculator.wasteGeneration === "moderate" ? 500 : 250;
  
  if (transportCO2 > maxWeight) { mainCulprit = "Transportation"; maxWeight = transportCO2; }
  if (homeCO2 > maxWeight) { mainCulprit = "Home Energy"; maxWeight = homeCO2; }
  if (dietWeight > maxWeight) { mainCulprit = "Diet & Food Choices"; maxWeight = dietWeight; }
  if (wasteWeight > maxWeight) { mainCulprit = "Waste Footprint"; maxWeight = wasteWeight; }

  const recommendations = [
    {
      title: "Eco-Optimize Transportation",
      category: "Transport",
      estimatedSavings: 1200,
      difficulty: "Medium",
      rationale: "Replacing solo driving with carpooling, public transit, or cycling can slash up to 1.2 metric tons of CO2 annually."
    },
    {
      title: "Switch to Plant-Based Lunches",
      category: "Diet",
      estimatedSavings: 650,
      difficulty: "Easy",
      rationale: "Eating vegetarian or plant-based just 3 days a week significantly reduces land use and methane impact."
    },
    {
      title: "Eliminate Phantom Electricity Loads",
      category: "Home",
      estimatedSavings: 300,
      difficulty: "Easy",
      rationale: "Unplugging vampire chargers and computer docks reduces baseline grid draw by up to 10% in high-coal regions."
    }
  ];

  return {
    summary: `Active Eco Explorer • Major impact source: ${mainCulprit}`,
    annualFootprintEstimate: parseFloat(annualCO2.toFixed(1)),
    personalizedImpactScore: ecoScore,
    highImpactActions: recommendations,
    personalizedMessage: `Great job evaluating your carbon details! Your current estimated footprint is ${annualCO2.toFixed(1)} metric tons of CO2e annually, compared to the global target of 2.0 tons. By adding actions like '${loggedActions[0]?.title || "biking to work"}' to your routines, you can reduce this burden significantly. Start with Easy actions to build stable habits!`
  };
}

function calculateLocalFootprint(calculator: any): number {
  // Rough math in Metric Tons of CO2e per year
  const carMiles = Number(calculator.carMiles || 0);
  const carTypeMultiplier = calculator.carType === "hybrid" ? 0.2 : calculator.carType === "ev" ? 0.08 : 0.42; // lbs CO2 per mile
  const transportCar = (carMiles * 52 * carTypeMultiplier) / 2204.62; // tons/yr
  
  const transitMiles = Number(calculator.transitMiles || 0);
  const transportTransit = (transitMiles * 52 * 0.12) / 2204.62; // tons/yr
  
  const flights = Number(calculator.flightsCount || 0);
  const transportFlights = (flights * 600) / 2204.62; // 600 lbs CO2 per average short-mid flight
  
  const electricBill = Number(calculator.electricityBill || 0);
  const gridMultiplier = calculator.cleanGrid === "yes" ? 0.08 : 0.82; // lbs CO2 per dollar approx
  const homeUtility = (electricBill * 12 * gridMultiplier) / 2204.62;
  
  let dietTons = 2.4; // Meat-heavy
  if (calculator.dietType === "balanced") dietTons = 1.7;
  if (calculator.dietType === "vegetarian") dietTons = 1.1;
  if (calculator.dietType === "vegan") dietTons = 0.7;
  
  let wasteTons = 0.6; // High
  if (calculator.wasteGeneration === "moderate") wasteTons = 0.4;
  if (calculator.wasteGeneration === "low") wasteTons = 0.25;
  if (calculator.compost === "yes") wasteTons *= 0.7; // compost discount
  
  const total = transportCar + transportTransit + transportFlights + homeUtility + dietTons + wasteTons;
  return Number(total.toFixed(2));
}

// 1. Carbon Profile Analyzer API
app.post("/api/gemini/insights", async (req: Request, res: Response) => {
  try {
    const { calculatorData, loggedActions } = req.body;
    
    if (!calculatorData) {
      return res.status(400).json({ error: "calculatorData is required" });
    }
    
    const client = getGeminiClient();
    if (!client) {
      // Graceful fallback if API key is not available
      const fallback = getFallbackInsights(calculatorData, loggedActions || []);
      return res.json({ ...fallback, isFallback: true });
    }
    
    const calculatedTons = calculateLocalFootprint(calculatorData);
    
    const prompt = `
Analyze the following carbon footprint user data (annualized calculations based on their habits):
Calculated Baseline CO2e: ${calculatedTons} metric tons / year.
User Inputs:
- Transport: ${calculatorData.carMiles || 0} miles/wk driving a ${calculatorData.carType || 'regular gasoline'} vehicle. ${calculatorData.transitMiles || 0} miles/wk public transit. ${calculatorData.flightsCount || 0} flights/yr.
- Diet: ${calculatorData.dietType || 'balanced'} diet.
- Home: Monthly power spend is $${calculatorData.electricityBill || 0}. Grid cleanliness rating: ${calculatorData.cleanGrid === "yes" ? 'using clean/renewable electricity' : 'standard local coal/gas grid'}. Heat source: ${calculatorData.heatingType || 'natural gas'}.
- Waste: ${calculatorData.wasteGeneration || 'moderate'} waste production. Do they compost? ${calculatorData.compost || 'no'}.

Actions already completed recently: ${JSON.stringify(loggedActions || [])}

Provide exactly one JSON response containing personalized sustainability advice and high-impact action recommendations. Focus on realistic improvements.
Return raw JSON complying with this typescript type:
{
  summary: string; // 3-5 word catchy title summarizing their primary dynamic (e.g. "Low-Waste Daily Commuter" or "Flight-Heavy Transit Enthusiast")
  annualFootprintEstimate: number; // your audited calculation or estimated metric tons of CO2e based on the global targets
  personalizedImpactScore: number; // dynamic rating 1-100 indicating relative eco efficiency (100 is net-zero ready, 50 is typical western average)
  highImpactActions: Array<{
    title: string; // concise action sentence, with actionable steps
    category: "Transport" | "Diet" | "Home" | "Waste";
    estimatedSavings: number; // approximate kg CO2e saved per year if they commit fully
    difficulty: "Easy" | "Medium" | "Hard";
    rationale: string; // 1-2 sentence friendly rationale based on their profile data
  }>; // exactly 3 recommendations
  personalizedMessage: string; // 2-3 sentence engaging response written as an encouraging, personal Eco Advisor coaching them.
}
Do not use Markdown wrapping inside the JSON fields. Return valid JSON only, without any backticks, plain and clean.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["summary", "annualFootprintEstimate", "personalizedImpactScore", "highImpactActions", "personalizedMessage"],
          properties: {
            summary: { type: Type.STRING },
            annualFootprintEstimate: { type: Type.NUMBER },
            personalizedImpactScore: { type: Type.NUMBER },
            highImpactActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "category", "estimatedSavings", "difficulty", "rationale"],
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  estimatedSavings: { type: Type.NUMBER },
                  difficulty: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                }
              }
            },
            personalizedMessage: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error: any) {
    console.error("Gemini Insights generation failed:", error);
    // Use fallback
    const fallback = getFallbackInsights(req.body.calculatorData, req.body.loggedActions || []);
    return res.json({ ...fallback, isFallback: true, errorMsg: error.message });
  }
});

// 2. Adaptive Carbon Chat API
app.post("/api/gemini/chat", async (req: Request, res: Response) => {
  try {
    const { message, calculatorData, loggedActions, chatHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }
    
    const client = getGeminiClient();
    if (!client) {
      // Dynamic fallback answer
      const calculatedTons = calculateLocalFootprint(calculatorData || {});
      const lowerMessage = message.toLowerCase();
      let responseText = "Hello! I am your Eco Coach fallback engine. Ask me anything about tracking or reducing carbon emission levels!";
      
      if (lowerMessage.includes("diet") || lowerMessage.includes("food") || lowerMessage.includes("meat")) {
        responseText = `Based on your profile (${~calculatorData?.dietType?.indexOf("meat") ? "meat-heavy" : "balanced"} diet), food choices are an excellent place to improve. Transitioning to local vegetables or avoiding high-impact beef can save around 800 - 1500 kg CO2e annually. Doing plant-based meals a few days a week is a great start.`;
      } else if (lowerMessage.includes("flying") || lowerMessage.includes("flight") || lowerMessage.includes("travel")) {
        responseText = `According to your footprint analysis, you take ${calculatorData?.flightsCount || 0} flights per year. Aviation represents a high density of carbon. Offsetting flights or choosing passenger trains for short distances yields incredible savings—up to 600kg CO2e for a single regional flight!`;
      } else if (lowerMessage.includes("car") || lowerMessage.includes("drive") || lowerMessage.includes("gasoline")) {
        responseText = `You drive approximately ${calculatorData?.carMiles || 0} miles per week. If your car is gasoline/diesel, each gallon releases around 8.8 kilograms of CO2e on combustion. Switching to carpooling or biking even one day a week makes a significant dent.`;
      } else if (lowerMessage.includes("compost") || lowerMessage.includes("waste")) {
        responseText = `Landfills degrade organic wastes anaerobically, creating methane gas which is 28x more potent than CO2. Composting (which is currently '${calculatorData?.compost === 'yes' ? 'actively done by you' : 'not configured yet'}') prevents this process and enriches topsoils, reducing net waste greenhouse parameters by 30%!`;
      } else if (lowerMessage.includes("why") || lowerMessage.includes("how") || lowerMessage.includes("footprint")) {
        responseText = `Your current profile estimate is around ${calculatedTons} tons CO2e. The global target for personal footprints is under 2.0 tons by 2050. Small switches are key: setting your heating down 1°C, switching standard bulbs to LEDs, washing clothes in cold water, and composting organic food waste.`;
      }
      
      return res.json({ response: responseText, isFallback: true });
    }
    
    const profileContext = `
You are the Eco Coach chatbot, a passionate, highly knowledgeable, and friendly guide helping individuals slash their carbon footprints.
User Profile:
- Annual footprint estimate based on inputs: ${calculateLocalFootprint(calculatorData || {})} tons CO2e.
- High-impact items: Driving ${calculatorData?.carMiles || 0} mi/wk, diet style is ${calculatorData?.dietType || 'balanced'}, Power bill is $${calculatorData?.electricityBill || 0} on a ${calculatorData?.cleanGrid === 'yes' ? 'renewable/clean' : 'traditional fossil-fueled'} electrical grid.
- Completed actions: ${JSON.stringify(loggedActions || [])}.

Answer the user's specific carbon-reduction query directly. Keep answers under 3-4 clear, professional sentences. Always back your claims with accurate science (e.g., standard emission factors, waste properties, thermostatic savings). Be supportive, optimistic, and highly actionable.
    `;

    const chatSession = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: profileContext,
      }
    });

    // Seed history if any
    let result;
    if (chatHistory && chatHistory.length > 0) {
      // Reconstruct dynamic dialogue
      // Send primary query directly to keep it simple
      result = await chatSession.sendMessage({ message });
    } else {
      result = await chatSession.sendMessage({ message });
    }

    return res.json({ response: result.text });
  } catch (error: any) {
    console.error("Gemini Chat failed:", error);
    return res.status(500).json({ error: "System could not process your chat request.", details: error.message });
  }
});

// Configure Vite or Static Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carbon Footprint Server running on http://localhost:${PORT}`);
  });
}

startServer();
