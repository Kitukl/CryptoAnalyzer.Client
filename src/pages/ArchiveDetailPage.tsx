import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Database, Maximize2, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { Typography, Spin, Tag } from 'antd';
import ChartCanvas from '../components/ChartCanvas';

const { Text: AntText } = Typography;

const ArchiveDetailPage: React.FC = () => {
  const { predictionId } = useParams<{ predictionId: string }>();
  const chartRef = useRef<{ resetZoom: () => void } | null>(null);

  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = 'http://localhost:5081/api';

  useEffect(() => {
    const loadArchiveData = async () => {
      try {
        setLoading(true);
        const archRes = await fetch(`${API_BASE}/PredictionHistory/${predictionId}`);
        if (!archRes.ok) throw new Error("Prediction not found");
        const archData = await archRes.json();
        
        const [infoRes, histRes] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/coins/${archData.coinId}`),
          fetch(`https://api.coingecko.com/api/v3/coins/${archData.coinId}/market_chart?vs_currency=usd&days=90&interval=daily`)
        ]);

        const marketInfo = await infoRes.json();
        const marketHistory = await histRes.json();

        // Створюємо карту реальних цін у ЛОКАЛЬНОМУ часі
        const realPriceMap = new Map();
        marketHistory.prices.forEach(([ts, price]: [number, number]) => {
          const d = new Date(ts);
          const dateKey = d.toLocaleDateString('en-CA'); // Формат YYYY-MM-DD
          realPriceMap.set(dateKey, price);
        });

        // Зсуваємо прогноз на 1 день назад і підтягуємо реальну ціну
        const enrichedPredictions = archData.predictions.map((p: any) => {
          const predDate = new Date(p.date);
          predDate.setDate(predDate.getDate() - 1); // ФІКС: Зсуваємо на 25-те число
          
          const dateKey = predDate.toLocaleDateString('en-CA');

          return {
            ...p,
            date: predDate.toISOString(), // Оновлена дата
            realPrice: realPriceMap.get(dateKey) || null
          };
        });

        setData(marketInfo);
        setHistory(marketHistory.prices);
        setPrediction({
          ...archData,
          predictions: enrichedPredictions
        });
      } catch (err) {
        console.error("Помилка завантаження:", err);
      } finally {
        setLoading(false);
      }
    };

    if (predictionId) loadArchiveData();
  }, [predictionId]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B0E14]"><Spin size="large" /></div>;

  const currentPrice = data?.market_data?.current_price?.usd || 0;

  return (
    <div className="space-y-8 p-4 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <Link to="/history" className="flex items-center gap-2 text-gray-500 hover:text-white font-bold transition-colors uppercase text-[10px] tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Назад до історії
        </Link>
        <button onClick={() => chartRef.current?.resetZoom()} className="bg-gray-800/50 hover:bg-gray-700 px-4 py-2 rounded-full border border-gray-700 text-[10px] font-black uppercase text-gray-300">
          <Maximize2 className="w-3 h-3 inline mr-2" /> Скинути зум
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-[#161B22] border border-gray-800 rounded-[2.5rem] p-10 relative shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
              <img src={data?.image?.small} className="w-16 h-16 shadow-2xl" alt="" />
              <div>
                <h1 className="text-4xl font-black uppercase italic text-white leading-none">{data?.name}</h1>
                <p className="text-indigo-400 font-mono text-xl mt-1 font-bold">
                    ${currentPrice.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]"></div>
                    <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">AI Prediction</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Real Market</span>
                </div>
            </div>
          </div>
          
          <div className="h-[450px] w-full bg-gray-900/30 rounded-[3rem] border border-gray-800/50 overflow-hidden p-4">
            <ChartCanvas 
              ref={chartRef} 
              prices={history} 
              calcData={prediction} 
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1c222b] border border-gray-800 rounded-[2.5rem] p-8 h-full">
             <Database className="w-8 h-8 text-indigo-500 mb-4" />
             <AntText className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Прогноз створено</AntText>
             <h3 className="text-xl font-black italic text-white mt-1">
                {prediction?.updatedAt ? new Date(prediction.updatedAt).toLocaleString('uk-UA') : '---'}
             </h3>
             <div className="mt-10 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
                <AntText className="text-xs text-gray-400 leading-relaxed block">
                    Тут ви можете порівняти точність AI моделі з реальним рухом ціни, що стався після запиту. Оранжева лінія — прогноз, синя — ринок.
                </AntText>
             </div>
          </div>
        </div>
      </div>

      {prediction?.predictions?.length > 0 && (
        <div className="bg-[#161B22] border border-gray-800 rounded-[3rem] p-10 shadow-2xl">
          <div className="flex items-center gap-4 mb-10">
             <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><TrendingUp className="w-8 h-8"/></div>
             <h2 className="text-2xl font-black italic uppercase text-white tracking-tight">Порівняльна таблиця точності</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <th className="px-8 py-4">Дата</th>
                  <th className="px-8 py-4">AI Прогноз</th>
                  <th className="px-8 py-4">Реальний ринок</th>
                  <th className="px-8 py-4 text-right">Похибка (Accuracy)</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm font-bold">
                {prediction.predictions.map((item: any, index: number) => {
                  const hasReal = item.realPrice !== null;
                  const diff = hasReal ? Math.abs(item.price - item.realPrice) : null;
                  const errorPercent = hasReal ? ((diff! / item.realPrice) * 100).toFixed(2) : null;

                  return (
                    <tr key={index} className="bg-gray-900/40 hover:bg-gray-800/80 transition-all">
                      <td className="px-8 py-6 rounded-l-[2rem] text-gray-400 border-l border-y border-gray-800/50">
                        {new Date(item.date).toLocaleDateString('uk-UA')}
                      </td>
                      <td className="px-8 py-6 text-orange-400 text-lg">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-8 py-6 text-blue-400 text-lg">
                        {hasReal ? `$${item.realPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : <span className="text-gray-600 italic">Очікується...</span>}
                      </td>
                      <td className={`px-8 py-6 rounded-r-[2rem] text-right border-r border-y border-gray-800/50`}>
                        {hasReal ? (
                          <div className="flex items-center justify-end gap-3">
                            {parseFloat(errorPercent!) < 3 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            <span className={parseFloat(errorPercent!) < 5 ? 'text-green-500' : 'text-yellow-500'}>
                               {errorPercent}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-700">---</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveDetailPage;