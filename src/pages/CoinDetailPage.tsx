import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, TrendingUp, Cpu, Play, 
  Info, Layers, RefreshCw, Target, Maximize2 
} from 'lucide-react';
import ChartCanvas from '../components/ChartCanvas';

const CACHE_DURATION = 15 * 60 * 1000;

const CoinDetailPage: React.FC = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const chartRef = useRef<{ resetZoom: () => void } | null>(null);

  const [data, setData] = useState<any>(null);
  const [fullHistory, setFullHistory] = useState<any[]>([]); // Зберігаємо повні 90 днів
  const [history, setHistory] = useState<any[]>([]);         // Обрізані дані для графіка
  const [prediction, setPrediction] = useState<any>(null);
  
  const [daysToPredict, setDaysToPredict] = useState(7);
  const [historyDays, setHistoryDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);

  // Функція для фільтрації даних на основі вибраної глибини (historyDays)
  const sliceHistoryData = (allPrices: any[], days: number) => {
    if (!allPrices.length) return [];
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;
    return allPrices.filter(p => p[0] >= startTime);
  };

  const loadBaseData = async () => {
    // Кеш тепер спільний для всіх значень глибини, бо ми завжди тягнемо 90 днів
    const cacheKey = `coin_full_90d_cache_${coinId}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        setData(parsed.info);
        setFullHistory(parsed.history);
        setHistory(sliceHistoryData(parsed.history, historyDays));
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      const [info, hist] = await Promise.all([
        axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`),
        // ЗАВЖДИ запитуємо максимум (90 днів)
        axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=90`)
      ]);

      setData(info.data);
      setFullHistory(hist.data.prices);
      setHistory(sliceHistoryData(hist.data.prices, historyDays));

      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        info: info.data,
        history: hist.data.prices
      }));
    } catch (err: any) {
      if (err.response?.status === 429) alert("Ліміт запитів API вичерпано!");
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const res = await axios.get(`http://localhost:5081/api/Forecast/${coinId}/forecast/${daysToPredict}/${historyDays}`);
      setPrediction(res.data);
    } catch (err) {
      alert("Помилка AI модуля");
    } finally {
      setIsPredicting(false);
    }
  };

  // Завантажуємо дані лише один раз при зміні монети
  useEffect(() => { 
    loadBaseData();
  }, [coinId]);

  // При зміні повзунка historyDays просто ріжемо масив у пам'яті
  useEffect(() => {
    if (fullHistory.length > 0) {
      setHistory(sliceHistoryData(fullHistory, historyDays));
      setPrediction(null); // Скидаємо прогноз, бо він неактуальний для нової глибини
    }
  }, [historyDays, fullHistory]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0B0E14]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group font-bold">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>До терміналу</span>
        </Link>
        
        <button 
          onClick={() => chartRef.current?.resetZoom()}
          className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700 px-4 py-2 rounded-full border border-gray-700 transition-all text-[10px] font-black uppercase tracking-widest text-gray-300"
        >
          <Maximize2 className="w-3 h-3" /> Скинути зум
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#161B22] border border-gray-800 rounded-[2.5rem] p-10 shadow-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-6">
              <img src={data?.image?.large} className="w-20 h-20 drop-shadow-[0_0_20px_rgba(99,102,241,0.2)]" alt="" />
              <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase italic">{data?.name}</h1>
                <p className="text-indigo-400 font-mono text-2xl mt-1 font-bold">${data?.market_data?.current_price?.usd?.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-black px-4 py-2 rounded-2xl ${data?.market_data?.price_change_percentage_24h >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {data?.market_data?.price_change_percentage_24h > 0 ? '+' : ''}
                {data?.market_data?.price_change_percentage_24h?.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="h-[400px] w-full bg-gray-900/30 rounded-[2rem] p-4 border border-gray-800/50">
            <ChartCanvas ref={chartRef} prices={history} calcData={prediction} />
          </div>
        </div>

        <div className="bg-[#161B22] border border-gray-800 rounded-[2.5rem] p-10 flex flex-col shadow-2xl">
          <div className="flex-1 space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><Cpu className="w-7 h-7"/></div>
              <h2 className="text-xl font-black italic uppercase">AI Forecast</h2>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Target className="w-4 h-4 text-indigo-500"/> Період прогнозу</p>
              <div className="grid grid-cols-3 gap-3">
                {[3, 7, 14].map(d => (
                  <button key={d} onClick={() => setDaysToPredict(d)}
                    className={`py-4 rounded-2xl border-2 font-black transition-all text-sm ${daysToPredict === d ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                  >
                    {d} ДНІВ
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500"/> Глибина аналізу</p>
                <span className="text-xs font-mono font-bold text-indigo-400">{historyDays}дн</span>
              </div>
              <input type="range" min="30" max="100" value={historyDays} onChange={(e) => setHistoryDays(+e.target.value)}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <button onClick={handlePredict} disabled={isPredicting}
            className="w-full mt-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 py-6 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-4 uppercase italic"
          >
            {isPredicting ? <RefreshCw className="animate-spin" /> : <>Аналізувати <Play className="w-5 h-5 fill-current" /></>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Капіталізація', val: `$${data?.market_data?.market_cap?.usd?.toLocaleString()}`, icon: <Info className="w-4 h-4"/> },
          { label: 'В обігу', val: data?.market_data?.circulating_supply?.toLocaleString(), icon: <Layers className="w-4 h-4"/> },
          { label: 'ATH', val: `$${data?.market_data?.ath?.usd?.toLocaleString()}`, icon: <Target className="w-4 h-4"/> }
        ].map((s, i) => (
          <div key={i} className="bg-[#161B22]/40 border border-gray-800 p-8 rounded-[2rem] flex items-center gap-5">
            <div className="p-3 bg-gray-800 rounded-xl text-gray-500">{s.icon}</div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase">{s.label}</p>
              <p className="text-xl font-mono font-bold text-gray-100">{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinDetailPage;