
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { MODELS } from "../constants.tsx";
import { TradeSignal } from "../types.ts";

export interface AIResponse {
  text: string;
  thought?: string;
}

export class GeminiService {
  private get ai() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async scanGlobalMarkets(marketDataSummary: string): Promise<{ bestOpportunity: string, action: 'BUY' | 'SELL' | 'HOLD', reason: string, confidence: number }> {
    const response = await this.ai.models.generateContent({
      model: MODELS.CHAT_FAST,
      contents: `AUTOPILOT_SCANNER_V16. Data: ${marketDataSummary}. Analyze high-timeframe liquidity. Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestOpportunity: { type: Type.STRING },
            action: { type: Type.STRING },
            reason: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["bestOpportunity", "action", "reason", "confidence"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async analyzeMarket(prompt: string, thinking: boolean = true): Promise<AIResponse> {
    const response = await this.ai.models.generateContent({
      model: MODELS.CHAT_MAIN,
      contents: prompt,
      config: {
        systemInstruction: "AETERNA-SYSTEM: Clinical institutional analyst. Analyze SMC and liquidity footprints.",
        thinkingConfig: { thinkingBudget: thinking ? 32768 : 0 }
      }
    });

    return {
      text: response.text || "Uplink failure.",
      thought: response.candidates?.[0]?.content?.parts?.find((p: any) => p.thought)?.text
    };
  }

  async generateImage(prompt: string): Promise<string | undefined> {
    const response = await this.ai.models.generateContent({
      model: MODELS.IMAGE_GEN,
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return undefined;
  }

  async generateVideo(prompt: string): Promise<string> {
    const aiInstance = this.ai;
    let operation = await aiInstance.models.generateVideos({
      model: MODELS.VIDEO_GEN,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await aiInstance.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    return `${downloadLink}&key=${process.env.API_KEY}`;
  }

  async generateMarketPodcast(script: string): Promise<string | undefined> {
    const response = await this.ai.models.generateContent({
      model: MODELS.TTS,
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              {
                speaker: 'Joe',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
              {
                speaker: 'Jane',
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Puck' },
                },
              },
            ],
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }

  async searchGrounding(query: string): Promise<{ text: string, grounding: any[] }> {
    const response = await this.ai.models.generateContent({
      model: MODELS.CHAT_FAST,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return {
      text: response.text || "",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }

  async findLocalFinancialNodes(lat: number, lng: number): Promise<{ text: string, places: any[] }> {
    const response = await this.ai.models.generateContent({
      model: MODELS.MAPS_GROUNDING,
      contents: "Find banking institutions, ATMs, or stock market locations near me",
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
      text: response.text || "",
      places: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }

  // Helper methods for audio decoding
  public static decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  public static async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const gemini = new GeminiService();
