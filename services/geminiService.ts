import { GoogleGenAI } from "@google/genai";
import { HotelInfo } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTaxiCard = async (hotel: HotelInfo): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "請先設定 API Key 才能使用智慧翻譯功能。";

  try {
    const prompt = `
      I am a traveler. Please generate a "Taxi Card" for the following hotel that I can show to a taxi driver.
      
      Hotel Name: ${hotel.name}
      Address: ${hotel.address}
      
      Requirements:
      1. Identify the likely language of the destination based on the address/name (e.g., Japanese for Tokyo, Thai for Bangkok).
      2. Provide the text in that LOCAL language clearly and in large text format.
      3. Also include the English name below it.
      4. Add a polite phrase in the local language saying "Please take me to this address."
      5. Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "無法產生翻譯，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "發生錯誤，無法連線至 AI 服務。";
  }
};

export const askTravelAssistant = async (query: string, context: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "請先設定 API Key。";

  try {
    const prompt = `
      You are a helpful travel assistant.
      Context: ${context}
      
      User Query: ${query}
      
      Answer concisely and helpfully. If it involves currency, give rough estimates but warn they change.
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
    // Only fetch if valid currencies
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