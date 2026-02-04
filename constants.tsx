
export const BINANCE_KEY = "a1kYbj6LMuebi5PmySwGa6hKkDHY89kIAlD7uRy4mw7sTx9Idkaxh4Hm9qzP61vR";
export const BINANCE_SECRET = "aVen6SZb9zDdvmIC173YnM9SLFxuBZBymhqdqrDJgIBzyTK1l8b5ZzbkYOQzEiqw";

export const MASTER_DEVICE_SIGNATURE = "AETERNA-MASTER-AUTH-ID"; 

export const BYBIT_KEY = "bybit_key_placeholder_9921";
export const BYBIT_SECRET = "bybit_secret_placeholder_sacred";

export const TELEGRAM_BOT_TOKEN = "728391:AAH_telegram_node_key";
export const TELEGRAM_CHAT_ID = "12345678";

export const GROQ_API_KEY = "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";

// Daftar aset untuk Autopilot Scanner
export const SCAN_SYMBOLS = [
  { id: 'BTC', category: 'crypto', label: 'Bitcoin' },
  { id: 'ETH', category: 'crypto', label: 'Ethereum' },
  { id: 'SOL', category: 'crypto', label: 'Solana' },
  { id: 'XAU', category: 'metals', label: 'Gold (Spot)' },
  { id: 'EUR', category: 'forex', label: 'EUR/USD' },
  { id: 'GBP', category: 'forex', label: 'GBP/USD' },
  { id: 'XAG', category: 'metals', label: 'Silver' }
];

export const MODELS = {
  CHAT_MAIN: 'gemini-3-pro-preview', 
  CHAT_FAST: 'gemini-3-flash-preview',
  MAPS_GROUNDING: 'gemini-2.5-flash',
  IMAGE_GEN: 'gemini-2.5-flash-image',
  VIDEO_GEN: 'veo-3.1-fast-generate-preview',
  TTS: 'gemini-2.5-flash-preview-tts'
};
