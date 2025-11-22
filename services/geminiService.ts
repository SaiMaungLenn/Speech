import { GoogleGenAI, Modality } from "@google/genai";
import { VoiceName } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpeech = async (
  text: string,
  voiceName: VoiceName
): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
        // Critical for Polyglot support: Explicitly instruct the model to read verbatim
        // preventing it from trying to "answer" the Burmese text.
        systemInstruction: "You are a professional Text-to-Speech engine. Your sole task is to read the user provided text aloud verbatim. Do not translate it. Do not answer it. Do not provide any text feedback. If the text is in a language like Burmese, read it in that language naturally.",
      },
    });

    const candidate = response.candidates?.[0];
    const firstPart = candidate?.content?.parts?.[0];

    // Check if the model returned text refusal instead of audio
    if (firstPart?.text) {
      console.warn("Gemini returned text instead of audio:", firstPart.text);
      throw new Error(`Gemini refused to generate audio: "${firstPart.text}"`);
    }

    const base64Audio = firstPart?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};