
import { GoogleGenAI } from "@google/genai";
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';

/**
 * AETERNA CLOUD WORKER CORE v12.0
 * Berjalan 24/7 di server Hugging Face
 */

const API_KEY = process.env.API_KEY || "AIzaSyBn-B0qzWTBulHQvHNEtDhnPuqlSVUUAsE";
const BINANCE_KEY = process.env.BINANCE_API_KEY || "a1kYbj6LMuebi5PmySwGa6hKkDHY89kIAlD7uRy4mw7sTx9Idkaxh4Hm9qzP61vR";
const BINANCE_SECRET = process.env.BINANCE_API_SECRET || "aVen6SZb9zDdvmIC173YnM9SLFxuBZBymhqdqrDJgIBzyTK1l8b5ZzbkYOQzEiqw";

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function getMarketData(symbol) {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
    const data = await res.json();
    return {
      price: parseFloat(data.lastPrice),
      change: parseFloat(data.priceChangePercent),
      volume: parseFloat(data.volume)
    };
  } catch (e) { return null; }
}

async function executeTrade(side, symbol, amount) {
  const timestamp = Date.now();
  // Gunakan quoteOrderQty agar nominal USDT yang dipotong presisi (Min 10 USDT di Binance)
  const query = `symbol=${symbol}USDT&side=${side}&type=MARKET&quoteOrderQty=${amount}&timestamp=${timestamp}`;
  const signature = CryptoJS.HmacSHA256(query, BINANCE_SECRET).toString(CryptoJS.enc.Hex);
  
  try {
    console.log(`[EXECUTION] Sending ${side} order for ${symbol}...`);
    const res = await fetch(`https://api.binance.com/api/v3/order?${query}&signature=${signature}`, {
      method: 'POST',
      headers: { 'X-MBX-APIKEY': BINANCE_KEY }
    });
    const result = await res.json();
    if (result.orderId) {
      console.log(`[SUCCESS] Order ID: ${result.orderId} filled at price ${result.fills[0]?.price}`);
    } else {
      console.error(`[FAILED] ${result.msg}`);
    }
    return result;
  } catch (e) { 
    console.error("[NETWORK ERROR]", e.message);
    return { error: e.message }; 
  }
}

async function runAutopilot() {
  console.log(`[${new Date().toLocaleTimeString()}] --- AETERNA NEURAL CYCLE ---`);
  
  const assets = ["BTC", "ETH", "SOL"];
  
  for (const symbol of assets) {
    const data = await getMarketData(symbol);
    if (!data) continue;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: `Analyze ${symbol}/USDT. Price: ${data.price}, 24h Change: ${data.change}%, Volume: ${data.volume}. Strategy: Neural Aggressive (SMC/ICT). 
        Should I BUY, SELL, or HOLD? Buy only if liquidity sweep detected.
        Output JSON: {"action": "BUY"|"SELL"|"HOLD", "confidence": 0-100, "logic": "..."}`,
        config: { responseMimeType: "application/json" }
      });

      const signal = JSON.parse(response.text);
      console.log(`[AI] ${symbol}: ${signal.action} (${signal.confidence}%) - ${signal.logic}`);

      if (signal.action !== 'HOLD' && signal.confidence > 85) {
        // Eksekusi jika sinyal sangat kuat
        await executeTrade(signal.action, symbol, 15); // Default trade 15 USDT
      }
    } catch (e) {
      console.error(`[BRAIN ERROR ${symbol}]`, e.message);
    }
  }
}

// Inisialisasi: Jalankan setiap 10 menit untuk menghindari rate limit Binance & Gemini
console.log("AETERNA CLOUD WORKER INITIALIZED - 24/7 REAL-TIME SYNC ACTIVE");
setInterval(runAutopilot, 600000); 
runAutopilot();
