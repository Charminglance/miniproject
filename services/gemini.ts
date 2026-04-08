
import { GoogleGenAI } from "@google/genai";

export async function getNearbyStations(lat: number, lng: number) {
  try {
    // Initializing GoogleGenAI with the required process.env.API_KEY directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Identify 5 real EV charging stations near coordinates (${lat}, ${lng}). 
      For each station, provide the exact Name, Full Address, Distance, and typical Cost if known.
      Crucially, identify 3-4 real nearby attractions (cafes, parks, shopping, or sights) within walking distance of that specific charging spot.
      List them clearly using the following format for each station:
      STATION_START
      NAME: [Name]
      ADDRESS: [Address]
      DISTANCE: [Distance]
      COST: [Cost per hour or "Unknown"]
      ATTRACTIONS: [Attraction 1, Attraction 2, Attraction 3]
      STATION_END`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    return {
      text: response.text,
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini Maps Grounding Error:", error);
    return null;
  }
}