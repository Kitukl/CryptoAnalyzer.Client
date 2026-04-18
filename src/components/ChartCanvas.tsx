import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface ChartProps {
  prices: any[]; // [[ms, price], ...]
  calcData: any; // Об'єкт { predictions: [{date, price}, ...], ... }
}

const ChartCanvas: React.FC<ChartProps> = ({ prices, calcData }) => {
  if (!prices || prices.length === 0) return null;

  // 1. Дістаємо масив прогнозів
  const predictions = calcData?.predictions || [];

  // 2. Формуємо мітки (Labels)
  // Спочатку мітки для історії
  const historyLabels = prices.map(p => 
    new Date(p[0]).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
  );
  
  // Потім додаємо мітки з прогнозів
  const forecastLabels = predictions.map((p: any) => 
    new Date(p.date).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })
  );

  const allLabels = [...historyLabels, ...forecastLabels];

  // 3. Формуємо Dataset історії
  const historyPrices = prices.map(p => p[1]);
  // Заповнюємо кінець null-ами, щоб звільнити місце під прогноз на шкалі X
  const historyDataset = [...historyPrices, ...new Array(predictions.length).fill(null)];

  // 4. Формуємо Dataset прогнозу
  // Він має початися рівно там, де закінчилася історія
  const forecastPrices = predictions.map((p: any) => p.price);
  const forecastDataset = new Array(historyPrices.length - 1).fill(null);
  
  forecastDataset.push(historyPrices[historyPrices.length - 1]); // З'єднувальна точка
  forecastDataset.push(...forecastPrices);

  const data = {
    labels: allLabels,
    datasets: [
      {
        label: 'Історія',
        data: historyDataset,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'AI Прогноз',
        data: forecastDataset,
        borderColor: '#fb923c', // Помаранчевий
        borderDash: [5, 5],
        backgroundColor: 'rgba(251, 146, 60, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fb923c',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#161B22',
        titleColor: '#9ca3af',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#4b5563', maxTicksLimit: 10 }
      },
      y: {
        grid: { color: 'rgba(75, 85, 99, 0.1)' },
        ticks: { 
          color: '#4b5563',
          callback: (value: any) => '$' + value.toLocaleString()
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};

export default ChartCanvas;