import React, { forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
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
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, zoomPlugin);

interface ChartProps {
  prices: any[];
  calcData: any;
}

const ChartCanvas = forwardRef((props: ChartProps, ref) => {
  const { prices, calcData } = props;
  const chartInternalRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    resetZoom: () => {
      if (chartInternalRef.current) chartInternalRef.current.resetZoom();
    }
  }));

  const chartLimits = useMemo(() => {
    if (!prices.length) return null;
    
    const allX = prices.map(p => p[0]);
    const allY = prices.map(p => p[1]);

    if (calcData?.predictions) {
      calcData.predictions.forEach((p: any) => {
        allX.push(new Date(p.date).getTime());
        allY.push(p.price);
      });
    }
    
    return {
      x: { min: Math.min(...allX), max: Math.max(...allX) },
      y: { min: Math.min(...allY) * 0.95, max: Math.max(...allY) * 1.05 }
    };
  }, [prices, calcData]);

  const data = useMemo(() => {
    const mainColor = '#6366f1'; 
    const forecastColor = '#fb923c'; 

    const datasets: any[] = [
      {
        label: 'Реальний ринок',
        data: prices.map((p: any) => ({ x: p[0], y: p[1] })),
        borderColor: mainColor,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          return gradient;
        },
      }
    ];

    if (calcData?.predictions?.length > 0 && prices.length > 0) {
      // ФІКС: Шукаємо точку в історії, з якої треба почати прогноз
      const firstPredTime = new Date(calcData.predictions[0].date).getTime();
      let anchorPoint = prices[prices.length - 1]; // За замовчуванням остання
      
      // Шукаємо найближчу точку в минулому до початку прогнозу
      for (let i = prices.length - 1; i >= 0; i--) {
        if (prices[i][0] <= firstPredTime) {
          anchorPoint = prices[i];
          break;
        }
      }

      const forecastPoints = [
        { x: anchorPoint[0], y: anchorPoint[1] },
        ...calcData.predictions.map((p: any) => ({
          x: new Date(p.date).getTime(),
          y: p.price
        }))
      ];

      datasets.push({
        label: 'AI Прогноз',
        data: forecastPoints,
        borderColor: forecastColor,
        borderWidth: 2,
        borderDash: [6, 4],
        tension: 0.4,
        pointRadius: (ctx: any) => ctx.dataIndex === 0 ? 0 : 3,
        pointBackgroundColor: forecastColor,
        fill: false, // НЕ заливаємо фон під прогнозом для чистоти
      });
    }

    return { datasets };
  }, [prices, calcData]);

  const xMin = chartLimits?.x.min ?? 0;
  const xMax = chartLimits?.x.max ?? 0;
  const yMin = chartLimits?.y.min ?? 0;
  const yMax = chartLimits?.y.max ?? 0;

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      zoom: {
        limits: {
          x: { min: xMin, max: xMax, minRange: (xMax - xMin) / 10 },
          y: { min: yMin, max: yMax }
        },
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' }
      },
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#161B22',
        padding: 12,
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: (context: any) => ` $${context.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      x: { 
        type: 'linear', 
        display: false,
        min: xMin,
        max: xMax
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)', drawBorder: false },
        ticks: { color: '#4b5563', font: { size: 10 } }
      }
    }
  };

  return <Line ref={chartInternalRef} data={data} options={options} />;
});

export default ChartCanvas;