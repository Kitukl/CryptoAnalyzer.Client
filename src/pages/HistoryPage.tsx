import React, { useEffect, useState } from 'react';
import { Typography, Spin, Empty, Tag } from 'antd';
import { HistoryOutlined, LineChartOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Імпортуємо чистий axios, щоб не юзати твій кривий конфіг

const { Title, Text } = Typography;

// Твоя структура з бека
interface HistoryItem {
  id: string;
  coinId: string;
  cratedAt: string; 
}

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ХАРДКОДИМО АДРЕСУ СЕРВІСУ ПРОГНОЗІВ
  const BACKEND_URL = 'http://localhost:5081/api/PredictionHistory';

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Колимо НАПРЯМУ на 5081, ігноруючи baseURL фронта
      const response = await axios.get<HistoryItem[]>(BACKEND_URL, {
        headers: {
          'accept': '*/*',
          // Якщо треба авторизація - розкоментуй рядок нижче
          // 'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      setHistory(response.data);
    } catch (error) {
      console.error("Помилка завантаження історії:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0B0E14]"><Spin size="large" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 p-6">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
          <HistoryOutlined style={{ fontSize: '28px' }} />
        </div>
        <div>
          <Title level={2} style={{ margin: 0, color: 'white' }} className="uppercase italic font-black tracking-tighter">
            Історія запитів
          </Title>
          <Text className="text-gray-500 font-medium">Сервіс: localhost:5081</Text>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-[#161B22] border border-gray-800 rounded-[2.5rem] p-20 flex flex-col items-center">
          <Empty description={<span className="text-gray-500 font-bold">Історія порожня (чистий 5081)</span>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => navigate(`/archive/${item.id}`)}
              className="group bg-[#161B22] border border-gray-800 rounded-[2rem] p-6 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase italic text-white">{item.coinId}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-xs mt-2 mb-6">
                  <CalendarOutlined /> {new Date(item.cratedAt).toLocaleString('uk-UA')}
                </div>
                <Tag color="indigo" className="font-black uppercase text-[10px]">ARCHIVE</Tag>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;