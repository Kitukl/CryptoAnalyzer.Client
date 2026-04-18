import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, TrendingUp, Cpu, Calendar, Play, Info, Layers, RefreshCw, Target } from 'lucide-react';
import ChartCanvas from '../components/ChartCanvas';

const CoinDetailPage: React.FC = () => {
  const { coinId } = useParams();
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  
  const [daysToPredict, setDaysToPredict] = useState(7);
  const [historyDays, setHistoryDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);

  const loadBaseData = async () => {
    try {
      const [info, hist] = await Promise.all([
        axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`),
        axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${historyDays}`)
      ]);
      setData(info.data);
      setHistory(hist.data.prices);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    try {
      const res = await axios.get(`http://localhost:5081/api/Forecast/${coinId}/forecast/${daysToPredict}/${historyDays}`);
      setPrediction(res.data);
    } catch (err) {
      alert("Помилка підключення до AI модуля");
    } finally {
      setIsPredicting(false);
        console.log("History:", history.length);
        console.log("Prediction data:", prediction);
    }
  };

  useEffect(() => { loadBaseData(); }, [coinId, historyDays]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0B0E14]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group font-bold">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>До терміналу</span>
        </Link>
        <div className="bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 text-center">Live Market Data</span>
        </div>
      </div>

      {/* Main Stats Card */}
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
            <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-3">
                 <span className={`text-sm font-black px-4 py-2 rounded-2xl ${data?.market_data?.price_change_percentage_24h >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {data?.market_data?.price_change_percentage_24h?.toFixed(2)}%
                </span>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">За останні 24г</p>
            </div>
          </div>
          
          {/* Chart Legend */}
          <div className="flex gap-4 mb-4 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2 text-gray-400">
                <div className="w-3 h-1 bg-indigo-500 rounded-full"></div> Історія цін
            </div>
            {prediction && (
                <div className="flex items-center gap-2 text-orange-400 animate-pulse">
                    <div className="w-3 h-1 bg-orange-400 rounded-full"></div> AI Прогноз
                </div>
            )}
          </div>

          <div className="h-[400px] w-full bg-gray-900/50 rounded-[2rem] p-6 border border-gray-800/50">
            <ChartCanvas prices={history} calcData={prediction} />
          </div>
        </div>

        {/* AI Control Panel */}
        <div className="bg-[#161B22] border border-gray-800 rounded-[2.5rem] p-10 flex flex-col shadow-2xl">
          <div className="flex-1 space-y-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-inner"><Cpu className="w-7 h-7"/></div>
              <div>
                <h2 className="text-xl font-black italic uppercase">AI Forecast</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">Powered by Lyria 3</p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Target className="w-4 h-4 text-indigo-500"/> Період прогнозування</p>
              <div className="grid grid-cols-3 gap-3">
                {[3, 7, 14].map(d => (
                  <button 
                    key={d} 
                    onClick={() => setDaysToPredict(d)}
                    className={`py-4 rounded-2xl border-2 font-black transition-all text-sm ${daysToPredict === d ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-105' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'}`}
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
              <input 
                type="range" min="7" max="90" step="1" 
                value={historyDays} onChange={(e) => setHistoryDays(+e.target.value)}
                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          <button 
            onClick={handlePredict}
            disabled={isPredicting}
            className="w-full mt-12 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 py-6 rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/20 group uppercase tracking-tighter italic"
          >
            {isPredicting ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <>Аналізувати <Play className="w-5 h-5 fill-current group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Капіталізація', val: `$${data?.market_data?.market_cap?.usd?.toLocaleString()}`, icon: <Info className="w-4 h-4"/> },
          { label: 'В обігу', val: data?.market_data?.circulating_supply?.toLocaleString(), icon: <Layers className="w-4 h-4"/> },
          { label: 'Max Ціна (ATH)', val: `$${data?.market_data?.ath?.usd?.toLocaleString()}`, icon: <Target className="w-4 h-4 text-green-400"/> }
        ].map((s, i) => (
          <div key={i} className="bg-[#161B22]/40 border border-gray-800 p-8 rounded-[2rem] flex items-center gap-5 backdrop-blur-sm">
            <div className="p-3 bg-gray-800 rounded-xl text-gray-500">{s.icon}</div>
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</p>
              <p className="text-xl font-mono font-bold text-gray-100">{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoinDetailPage;