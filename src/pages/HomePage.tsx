import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Newspaper, X, Calendar, Activity, TrendingUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const CACHE_DURATION = 15 * 60 * 1000;
const NEWS_PER_PAGE = 3;

const HomePage: React.FC = () => {
  const [coins, setCoins] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = async () => {
    const cachedCoins = localStorage.getItem('market_coins_cache');
    let coinsData;

    if (cachedCoins) {
      const parsed = JSON.parse(cachedCoins);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        coinsData = parsed.data;
        setCoins(coinsData);
      }
    }

    try {
      const requests = [];
      
      if (!coinsData) {
        requests.push(
          axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12')
            .then(res => {
              setCoins(res.data);
              localStorage.setItem('market_coins_cache', JSON.stringify({
                timestamp: Date.now(),
                data: res.data
              }));
            })
        );
      }

      // ЗАПИТ НА НОВИНИ ЗАВЖДИ
      requests.push(
        axios.get('http://localhost:5128/api/News')
          .then(res => {
            // ТЕПЕР НЕ ФІЛЬТРУЄМО NULL, просто сортуємо за датою
            const allNews = res.data
              .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            setNews(allNews);
          })
      );

      await Promise.all(requests);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const newsGrade = (grade: number | null) => {
    if (grade === null) return null;
    if (grade > 0) return 'Позитивна';
    if (grade < 0) return 'Негативна';
    return 'Нейтральна';
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPages = Math.ceil(news.length / NEWS_PER_PAGE);
  const indexOfLastNews = currentPage * NEWS_PER_PAGE;
  const indexOfFirstNews = indexOfLastNews - NEWS_PER_PAGE;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            Crypto<span className="text-indigo-500">Analyzer</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">AI-прогнозування та моніторинг</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Пошук монети..." 
            className="bg-gray-800/50 border border-gray-700 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all w-full md:w-80 backdrop-blur-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
            <h2 className="text-xl font-bold tracking-tight">Останні новини</h2>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition-all text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-gray-500">{currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-30 transition-all text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentNews.map((item, i) => (
            <div key={i} 
              onClick={() => setSelectedNews(item)}
              className={`relative bg-[#161B22] border p-6 rounded-[2rem] cursor-pointer hover:bg-[#1C2128] transition-all duration-500 shadow-xl group overflow-hidden ${
                item.isGenerated ? 'border-indigo-500/40 ring-1 ring-indigo-500/10' : 'border-gray-800'
              }`}
            >
              {item.isGenerated && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-[8px] font-black px-3 py-1 rounded-bl-xl flex items-center gap-1 uppercase tracking-widest text-white">
                  <Sparkles className="w-2 h-2 animate-pulse" /> AI REPORT
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl transition-colors ${item.isGenerated ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Newspaper className="w-5 h-5" />
                </div>
                
                {item.grade !== null && (
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                    item.grade < 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {newsGrade(item.grade)}
                  </span>
                )}
              </div>

              <h3 className={`font-bold mb-3 line-clamp-2 leading-snug transition-colors ${item.isGenerated ? 'text-gray-100 group-hover:text-indigo-300' : 'text-gray-300 group-hover:text-white'}`}>
                {item.text.split('.')[0]}...
              </h3>

              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString('uk-UA')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Огляд ринку (без змін) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-bold tracking-tight">Огляд ринку</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCoins.map(coin => (
            <Link to={`/coin/${coin.id}`} key={coin.id} className="bg-[#161B22] p-5 rounded-2xl border border-gray-800 hover:border-indigo-500/50 transition-all flex items-center gap-4 shadow-lg group">
              <div className="relative">
                <img src={coin.image} className="w-12 h-12 rounded-full group-hover:scale-110 transition-transform" alt={coin.name} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-100 truncate">{coin.name}</p>
                    <TrendingUp className={`w-3 h-3 ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div className="flex justify-between items-end mt-1">
                    <p className="text-md font-mono text-indigo-400 font-bold">${coin.current_price?.toLocaleString()}</p>
                    <span className="text-[10px] text-gray-500 font-black uppercase">{coin.symbol}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B0E14] border border-gray-800 w-full max-w-2xl rounded-[2.5rem] p-10 relative shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setSelectedNews(null)} className="absolute top-8 right-8 p-2 hover:bg-gray-800 rounded-full transition text-gray-400">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${selectedNews.isGenerated ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
                  <Activity />
                </div>
                {selectedNews.isGenerated && (
                    <span className="bg-indigo-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-tighter text-white">AI Analytic Report</span>
                )}
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">
              {selectedNews.isGenerated ? 'Аналітичний звіт' : 'Новина ринку'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">{new Date(selectedNews.date).toLocaleString('uk-UA')}</p>
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 mb-8 leading-relaxed text-gray-200 text-lg max-h-60 overflow-y-auto">
                {selectedNews.text}
            </div>
            
            {selectedNews.grade !== null && (
              <div className="flex items-center justify-between p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
                <span className="font-bold text-indigo-300">Тенденція:</span>
                <span className={`text-xl font-mono font-black ${selectedNews.grade < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {newsGrade(selectedNews.grade)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;