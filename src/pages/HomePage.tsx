import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Newspaper, X, Calendar, Activity, TrendingUp } from 'lucide-react';

const HomePage: React.FC = () => {
  const [coins, setCoins] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12')
      .then(res => setCoins(res.data)).catch(console.error);
    
    axios.get('http://localhost:5128/api/News')
      .then(res => setNews(res.data)).catch(console.error);
  }, []);

  const filteredCoins = coins.filter(coin => 
    coin.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">
            Crypto<span className="text-indigo-500">Analyzer</span>
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Інтелектуальний моніторинг та AI-прогнозування активів</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Пошук активу..." 
            className="bg-gray-800/50 border border-gray-700 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all w-full md:w-80 backdrop-blur-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* News Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
          <h2 className="text-xl font-bold tracking-tight">Останні новини</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.slice(0, 3).map((item, i) => (
            <div key={i} 
              onClick={() => setSelectedNews(item)}
              className="bg-[#161B22] border border-gray-800 p-6 rounded-[2rem] cursor-pointer hover:bg-[#1C2128] hover:border-indigo-500/50 transition-all duration-300 shadow-xl group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <Newspaper className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${item.grade < 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                  Вплив: {item.grade}
                </span>
              </div>
              <h3 className="font-bold text-gray-100 mb-3 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                {item.text.split('.')[0]}...
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                <Calendar className="w-3 h-3" /> {new Date(item.date).toLocaleDateString('uk-UA')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-green-500 rounded-full"></div>
          <h2 className="text-xl font-bold tracking-tight">Огляд ринку</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCoins.map(coin => (
            <Link to={`/coin/${coin.id}`} key={coin.id} className="bg-[#161B22] p-5 rounded-2xl border border-gray-800 hover:border-indigo-500/50 transition-all group flex items-center gap-4 shadow-lg hover:shadow-indigo-500/5">
              <div className="relative">
                <img src={coin.image} className="w-12 h-12 rounded-full group-hover:rotate-12 transition-transform" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-100 truncate">{coin.name}</p>
                    <TrendingUp className={`w-3 h-3 ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div className="flex justify-between items-end mt-1">
                    <p className="text-md font-mono text-indigo-400 font-bold">${coin.current_price.toLocaleString()}</p>
                    <span className="text-[10px] text-gray-500 font-black uppercase">{coin.symbol}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Модалка новин (залишається як була) */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B0E14] border border-gray-800 w-full max-w-2xl rounded-[2.5rem] p-10 relative shadow-2xl animate-in zoom-in duration-300">
            <button onClick={() => setSelectedNews(null)} className="absolute top-8 right-8 p-2 hover:bg-gray-800 rounded-full transition text-gray-400">
              <X className="w-6 h-6" />
            </button>
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 w-fit mb-6"><Activity /></div>
            <h2 className="text-2xl font-black mb-2">Аналітичний звіт</h2>
            <p className="text-gray-500 text-sm mb-8">{new Date(selectedNews.date).toLocaleString('uk-UA')}</p>
            <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800 mb-8 leading-relaxed text-gray-200 text-lg">
                {selectedNews.text}
            </div>
            <div className="flex items-center justify-between p-5 bg-indigo-500/5 rounded-2xl border border-indigo-500/20">
              <span className="font-bold text-indigo-300">Оцінка впливу:</span>
              <span className={`text-xl font-mono font-black ${selectedNews.grade < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {selectedNews.grade > 0 ? '+' : ''}{selectedNews.grade}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;