
import CryptoJS from 'crypto-js';
import { TradingSource } from '../types';

const BASE_URL = 'https://api.binance.com';

export class BinanceService {
  private apiKey: string;
  private secretKey: string;

  constructor(apiKey: string, secretKey: string) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
  }

  private sign(queryString: string): string {
    return CryptoJS.HmacSHA256(queryString, this.secretKey).toString(CryptoJS.enc.Hex);
  }

  /**
   * GENERATOR HARGA REALISTIS (SINE WAVE + NOISE)
   * Menggunakan waktu saat ini (Date.now()) sebagai seed agar harga konsisten & mulus (smooth)
   * tidak melompat-lompat acak saat refresh.
   */
  private getMockPrice(asset: string, timeOffset: number = 0): number {
    const time = Date.now() - timeOffset;
    // Slow wave untuk tren utama (periode 1 jam)
    const trend = Math.sin(time / 3600000); 
    // Fast wave untuk volatilitas mikro (periode 1 menit)
    const noise = Math.sin(time / 60000) * 0.2 + (Math.sin(time / 5000) * 0.05);
    
    let basePrice = 0;
    let volatility = 0;

    if (asset === 'BTC') { basePrice = 64500; volatility = 500; }
    else if (asset === 'ETH') { basePrice = 3450; volatility = 50; }
    else if (asset === 'SOL') { basePrice = 148; volatility = 5; }
    else if (asset === 'BNB') { basePrice = 590; volatility = 10; }
    else if (asset === 'XRP') { basePrice = 0.62; volatility = 0.02; }
    
    // FOREX & INDICES
    else if (asset === 'XAU' || asset === 'GOLD' || asset === 'XAUUSD') { basePrice = 2350.50; volatility = 15.0; }
    else if (asset === 'EUR' || asset === 'EURUSD') { basePrice = 1.0850; volatility = 0.0050; }
    else if (asset === 'GBP' || asset === 'GBPUSD') { basePrice = 1.2640; volatility = 0.0060; }
    else if (asset === 'JPY' || asset === 'USDJPY') { basePrice = 155.20; volatility = 0.80; }
    else if (asset === 'US30') { basePrice = 39100; volatility = 150; }
    else { basePrice = 100.00; volatility = 1.0; }

    // Harga = Base + (Trend * Volatility * 0.5) + (Noise * Volatility * 0.1)
    // Ditambah sedikit random walk kecil yang deterministik berdasarkan waktu
    const deterministicRandom = Math.abs(Math.sin(time)) * volatility * 0.05;
    
    let price = basePrice + (trend * volatility * 0.5) + (noise * volatility * 0.2) + deterministicRandom;
    
    // Pastikan presisi desimal sesuai aset
    if (asset.includes('JPY') || asset === 'XAU' || asset === 'XAUUSD') return parseFloat(price.toFixed(2));
    if (['EUR', 'GBP', 'AUD'].some(c => asset.includes(c))) return parseFloat(price.toFixed(5));
    if (['BTC', 'US30'].includes(asset)) return parseFloat(price.toFixed(2));
    
    return parseFloat(price.toFixed(4));
  }

  private generateMockKlines(asset: string, limit: number = 50, source: TradingSource = 'binance') {
    const data = [];
    const intervalMs = 60 * 1000; // 1 Minute candles
    
    for (let i = limit; i >= 0; i--) {
        const timeOffset = i * intervalMs;
        const close = this.getMockPrice(asset, timeOffset);
        // Buat Open/High/Low relatif terhadap Close agar chart terlihat wajar
        const volatility = close * 0.0005; // 0.05% candle size
        
        data.push({
            time: Date.now() - timeOffset,
            price: close,
            open: close - (Math.random() - 0.5) * volatility,
            high: close + Math.random() * volatility,
            low: close - Math.random() * volatility,
            close: close,
            volume: Math.random() * 1000 + 500
        });
    }
    // Reverse agar urutan waktu benar (lama ke baru)
    return data.reverse(); 
  }

  private async signedRequest(endpoint: string, method: string = 'GET', params: Record<string, any> = {}) {
    if (!this.apiKey || !this.secretKey) return null;

    const timestamp = Date.now();
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => queryParams.append(key, params[key]));
    queryParams.append('timestamp', timestamp.toString());
    
    const queryString = queryParams.toString();
    const signature = this.sign(queryString);
    const url = `${BASE_URL}${endpoint}?${queryString}&signature=${signature}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-MBX-APIKEY': this.apiKey,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (e) {
      // Suppress error logging for expected CORS/Network issues in demo mode
      // console.warn("Binance API (Signed) unavailable, using local mock.");
      return null;
    }
  }

  // CORE: Fungsi tunggal untuk mengambil saldo dari SEMUA broker
  public async getUnifiedBalance(source: TradingSource, brokerKeys: any): Promise<number> {
    if (source === 'binance') {
        try {
            const activeKey = brokerKeys?.apiKey || this.apiKey;
            const activeSecret = brokerKeys?.secretKey || this.secretKey;
            
            if (activeKey && activeKey !== this.apiKey) {
                this.apiKey = activeKey;
                this.secretKey = activeSecret;
            }

            const data = await this.signedRequest('/api/v3/account');
            if (!data || !data.balances) return 0;
            const usdt = data.balances.find((b: any) => b.asset === 'USDT');
            return usdt ? parseFloat(usdt.free) : 0;
        } catch (e) {
            console.error("Binance Sync Failed:", e);
            return 0;
        }
    } 
    else {
        // Simulasi Koneksi Broker Stabil
        if (brokerKeys?.isAuthorized && brokerKeys?.accountId) {
             return -1; // -1 triggers state-based balance usage in App.tsx
        }
        return 0;
    }
  }

  public async getAccountBalance() {
     return this.getUnifiedBalance('binance', { apiKey: this.apiKey, secretKey: this.secretKey });
  }

  public async createOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number) {
    const params = {
      symbol: `${symbol}USDT`,
      side,
      type: 'MARKET',
      quoteOrderQty: quantity
    };
    return await this.signedRequest('/api/v3/order', 'POST', params);
  }

  public async getKlines(symbol: string, interval: string = '1h', limit: number = 50, source: TradingSource = 'binance') {
    if (source !== 'binance') {
        // Gunakan generator smooth untuk broker non-binance
        return this.generateMockKlines(symbol, limit, source);
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v3/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`);
      if (!response.ok) throw new Error("Binance Public API blocked");
      const data = await response.json();
      return data.map((d: any) => ({
        time: d[0],
        price: parseFloat(d[4]),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        volume: parseFloat(d[5])
      }));
    } catch (e) {
      // Fallback ke generator smooth jika API Binance gagal
      return this.generateMockKlines(symbol, limit, 'binance');
    }
  }

  public async getTickerPrice(symbol: string, source: TradingSource = 'binance') {
    // Force mock for non-binance sources OR if binance fetch fails
    if (source !== 'binance') {
       return this.getMockPrice(symbol);
    }
    try {
      const response = await fetch(`${BASE_URL}/api/v3/ticker/price?symbol=${symbol}USDT`);
      if (!response.ok) throw new Error("Ticker fetch failed");
      const data = await response.json();
      return parseFloat(data.price);
    } catch (e) {
      return this.getMockPrice(symbol);
    }
  }
}
