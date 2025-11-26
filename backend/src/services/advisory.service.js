import { GoogleGenAI } from "@google/genai";
import { getWeatherData } from "./weather.service.js";
import Crop from "../models/crop.model.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client — API key picked up automatically from GEMINI_API_KEY
const ai = new GoogleGenAI({});

/**
 * Generates AI-powered weather advisories for a user's crops.
 */
export const generateAdvisories = async (user) => {
  // 1. Get farmer's location and crop list from the database
  const [lon, lat] = user.location.coordinates;
  const userCrops = await Crop.find({ farmer: user._id });

  if (userCrops.length === 0) return [];

  // 2. Fetch the 7-day weather forecast
  const weatherData = await getWeatherData(lat, lon);

  const cropNames = userCrops.map((c) => c.cropName);
  const weatherForecastString = JSON.stringify(weatherData.daily, null, 2);

  // 3. Create the prompt for the Gemini model
  const prompt = `
    You are an expert agronomist for Indian agriculture. 
    Analyze the provided 7-day weather forecast for a farmer in Maharashtra growing these crops: ${cropNames.join(", ")}.

    Forecast Data: ${weatherForecastString}

    Identify potential threats (disease, pests, waterlogging, heat stress, etc.) for each crop.

    Return a JSON array of objects with this exact structure:
    [
      {
        "cropName": "string",
        "threatLevel": "Low" | "Medium" | "High",
        "threat": "string",
        "recommendation": "string",
        "impactDay": "YYYY-MM-DD"
      }
    ]

    If there are no threats, return an empty array [].
  `;

  // 4. Generate advisories with Gemini 2.5 Flash
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json", // Force JSON output
        thinkingConfig: {
          thinkingBudget: 0, // Disable "thinking" to improve speed/cost
        },
      },
    });

    const advisories = JSON.parse(response.text);
    return advisories;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return [
      {
        cropName: "System Alert",
        threatLevel: "Medium",
        threat: "Could not generate AI advisory at this time.",
        recommendation: "Please try again later.",
        impactDay: new Date().toISOString().split("T")[0],
      },
    ];
  }
};
