import { GoogleGenAI } from "@google/genai";
import { HotelInfo, FlightInfo, DailyWeather } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to clean JSON string (removes markdown code blocks)
const cleanJsonString = (text: string | undefined): string => {
  if (!text) return "null";
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

// --- Trip Analysis ---

export const predictFlightDetails = async (flightNumber: string): Promise<{ origin: string, destination: string } | null> => {
  const ai = getAiClient();
  if (!ai || !flightNumber) return null;

  try {
    const prompt = `
      Identify the typical Origin and Destination airport codes (IATA) and City Names for flight number "${flightNumber}".
      Return ONLY a JSON object like {"origin": "TPE (Taipei)", "destination": "NRT (Tokyo)"}.
      If unknown, guess based on common routes or return null.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    console.error("Flight Prediction Error:", error);
    return null;
  }
};

export const getTripTitle = async (flights: FlightInfo[]): Promise<{ title: string, location: string } | null> => {
  const ai = getAiClient();
  if (!ai || flights.length === 0) return null;

  try {
    const flightSummary = flights.map(f => `${f.flightNumber} on ${f.date} to ${f.destination}`).join(', ');
    const prompt = `
      Analyze these flights: ${flightSummary}.
      1. Determine the main destination city (e.g. Tokyo, Seoul, Paris).
      2. determine the trip Month/Year (e.g. 2025/06).
      
      Return a JSON: { "title": "City Name Trip (YYYY/MM)", "location": "City Name, Country" }.
      Example: { "title": "Japan Tokyo Trip (2025/06)", "location": "Tokyo, Japan" }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    return null;
  }
};

// --- Geocoding ---
export const getCoordinates = async (location: string): Promise<{ lat: number, lng: number } | null> => {
  if (!location) return null;
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=zh&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (geoData.results && geoData.results.length > 0) {
      return {
        lat: geoData.results[0].latitude,
        lng: geoData.results[0].longitude
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding Error:", error);
    return null;
  }
};

// --- Weather ---

export const getWeatherAdvice = async (location: string, startDate: string, endDate: string): Promise<{ daily: DailyWeather[], advice: string } | null> => {
  const ai = getAiClient();
  if (!ai || !location) return null;

  try {
    const prompt = `
      Predict the weather for: ${location} from ${startDate} to ${endDate}.
      
      Return a JSON object with:
      1. "daily": an array of objects for EACH day between the dates (inclusive), containing:
         - "date": "MM/DD"
         - "weather": "Emoji + Short Description (e.g. ☀️ Sunny)"
         - "temp": "High/Low (e.g. 25°C / 18°C)"
      2. "advice": "Clothing advice in Traditional Chinese (繁體中文). Be cute and helpful."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(cleanJsonString(response.text));
  } catch (error) {
    console.error("Weather Error:", error);
    return null;
  }
};

export const generateClothingAdvice = async (location: string, weatherSummary: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "無法連線至 AI 助理。";

  try {
    const prompt = `
      Based on the following REAL weather forecast for ${location}:
      ${weatherSummary}
      
      Provide a short, cute, and helpful clothing advice in Traditional Chinese (繁體中文).
      Max 50 words. Focus on what to wear (e.g. layers, umbrella, coat).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "目前無法提供穿衣建議。";
  } catch (error) {
    console.error("Advice Error:", error);
    return "連線錯誤，無法提供建議。";
  }
};

// --- Other Services ---

export const askTravelAssistant = async (query: string, context: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "請先設定 API Key。";

  try {
    const prompt = `
      You are a helpful travel assistant.
      Context: ${context}
      
      User Query: ${query}
      
      Answer concisely and helpfully.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "我現在有點忙，請稍後再問。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "連線錯誤。";
  }
};

export const getExchangeRate = async (from: string, to: string): Promise<number | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    if (!from || !to || from.length < 3 || to.length < 3) return null;

    const prompt = `
      What is the current estimated exchange rate from ${from} to ${to}? 
      Only return the number (e.g., 0.21 or 145.5). Do not write any text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text?.trim();
    const rate = parseFloat(text?.replace(/[^0-9.]/g, '') || '');
    return isNaN(rate) ? null : rate;
  } catch (error) {
    console.error("Gemini Currency Error:", error);
    return null;
  }
};