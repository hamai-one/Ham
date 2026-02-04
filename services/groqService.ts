
export interface GroqSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  tp: number;
  sl: number;
}

export interface GroqChatResponse {
  text: string;
  thought?: string;
}

export class GroqService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Helper untuk delay (untuk retry strategy)
  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async chatAnalysis(prompt: string, retryCount = 0): Promise<GroqChatResponse> {
    // 1. Validasi Key Dasar
    if (!this.apiKey || this.apiKey.includes('placeholder')) {
      return { 
        text: "⚠️ **SYSTEM ALERT:** API Key Groq belum dipasang. Silakan cek file `constants.tsx`.", 
        thought: "Authentication Failed: Missing Key" 
      };
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-r1-distill-llama-70b", // Pastikan model ini tersedia di akun Groq Anda
          messages: [
            {
              role: "system",
              content: "You are an advanced crypto trading AI assistant named Aeterna. You analyze market structure (SMC/ICT). Always answer in Indonesian. Output your internal reasoning inside <think> tags, then your answer."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.6,
          max_tokens: 4096, // Ditingkatkan agar jawaban tidak terpotong
          top_p: 0.95,
          stream: false
        })
      });

      // 2. Handling Error Spesifik
      if (!response.ok) {
        // Jika Rate Limit (429) dan belum retry, coba lagi setelah 2 detik
        if (response.status === 429 && retryCount < 1) {
          console.warn("Groq Rate Limit Hit. Retrying in 2s...");
          await this.delay(2000);
          return this.chatAnalysis(prompt, retryCount + 1);
        }

        const errBody = await response.json().catch(() => ({}));
        console.error(`GROQ API ERROR [${response.status}]:`, errBody);

        if (response.status === 401) return { text: "⚠️ Akses Ditolak: API Key Salah.", thought: "Check Constants.tsx" };
        if (response.status === 429) return { text: "⏳ Server DeepSeek sedang penuh (Rate Limit). Silakan coba 5 detik lagi atau ganti ke Gemini.", thought: "Traffic Overload" };
        if (response.status === 503) return { text: "🔌 Server Sedang Maintenance.", thought: "Service Unavailable" };
        
        throw new Error(`Groq Status: ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices[0]?.message?.content || "";

      // 3. Parsing <think> yang Lebih Cerdas (Robust Parsing)
      let thought = "";
      let text = rawContent;

      // Cek apakah ada tag think (pembuka)
      if (rawContent.includes("<think>")) {
        const parts = rawContent.split("</think>");
        
        // Ambil bagian thought (setelah <think>)
        thought = parts[0].replace("<think>", "").trim();
        
        // Ambil sisanya sebagai jawaban. Jika tidak ada penutup </think>, ambil semua sisa.
        if (parts.length > 1) {
          text = parts.slice(1).join("</think>").trim();
        } else {
          // Kasus aneh dimana tag pembuka ada tapi penutup tidak ada
          text = "System Reasoning Completed..."; 
        }
      } 
      // Fallback: Jika tidak ada tag think sama sekali, anggap semua adalah text
      else {
        thought = "Direct Analysis (No Chain-of-Thought provided by model)";
      }

      // Bersihkan sisa-sisa tag jika masih bocor
      text = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

      if (!text) text = "Analisis selesai, namun tidak ada output teks (Empty Response).";

      return { text, thought };

    } catch (error: any) {
      console.error("Critical Groq Error:", error);
      return { 
        text: `❌ Koneksi Terputus: ${error.message}. Coba refresh atau ganti ke mode Gemini.`, 
        thought: "Network/System Failure" 
      };
    }
  }

  // ... (Fungsi getDeepSeekSignal tetap sama, pastikan error handlingnya juga mirip)
  async getDeepSeekSignal(asset: string, price: number, strategy: string): Promise<GroqSignal | null> {
    if (!this.apiKey) return null;
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "deepseek-r1-distill-llama-70b",
          messages: [
            {
              role: "system",
              content: `You are a Trading Signal Generator. Return ONLY JSON.
              Format: {"action": "BUY"|"SELL"|"HOLD", "confidence": number, "reasoning": "string", "tp_percent": number, "sl_percent": number}`
            },
            { role: "user", content: `Analyze ${asset}/USDT. Price: ${price}. Strategy: ${strategy}.` }
          ],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) return null;
      const data = await response.json();
      const contentString = data.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
      const content = JSON.parse(contentString);

      return {
        action: content.action || "HOLD",
        confidence: content.confidence || 0,
        reasoning: content.reasoning || "No data",
        tp: content.tp_percent || 1,
        sl: content.sl_percent || 1
      };
    } catch (error) {
      return null;
    }
  }
}
