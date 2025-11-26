import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client with API key
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Converts a local file (uploaded image) to a Gemini API part object.
 * 
 */

const fileToGenerativePart = async (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const mimeType = "image/jpeg"; // adjust if needed

    return {
      mimeType,
      image: imageBuffer.toString("base64"),
    };
  } catch (error) {
    console.error(`Failed to read/process file: ${filePath}`, error);
    throw new Error("Could not process image for analysis.");
  }
};

/**
 * Analyzes crop disease using Gemini API.
 */
export const analyzeCropDisease = async (images, cropInfo, language) => {
  try {
    const targetLanguage = language === "mr" ? "Marathi" : "English";

    const prompt = `
      You are an expert agronomist specializing in crop diseases. Analyze the following image(s) of a ${cropInfo.cropVariety || ""} ${cropInfo.cropName} plant.

      Based on the visual evidence, provide a diagnosis in the following JSON format.
      Your entire response MUST be a single, valid JSON object and nothing else.
      The diagnosis and recommendation must be in ${targetLanguage}.

      {
        "detectedDisease": "Name of the disease",
        "diagnosis": "A detailed but easy-to-understand explanation of the disease, its causes, and symptoms visible in the image.",
        "recommendation": "A clear, step-by-step solution. Include names of specific chemical pesticides (and their composition) or organic solutions. Provide application instructions, dosage per acre, and precautionary measures."
      }
    `;

    // Convert uploaded images to Gemini parts
    const imageParts = await Promise.all(images.map((file) => fileToGenerativePart(file.path)));

    // Send request to Gemini model
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { text: prompt },
        ...imageParts.map((img) => ({ image: img.image, mimeType: img.mimeType })),
      ],
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const responseText = result.text;
    const jsonResponse = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(jsonResponse);
  } catch (error) {
    console.error("Error during Gemini API call:", error);
    throw new Error("Failed to get analysis from AI service.");
  }
};
