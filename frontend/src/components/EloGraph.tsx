import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
// import * as api from '../api/api';
import { mockWeeklyWinrateData, type WeeklyPoint } from '../data/mock_data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// type WeeklyPoint = {
//   dayIndex: number;
//   date: string;
//   winrate: number;
// };

const labels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function EloGraph() {
  const [points, setPoints] = useState<WeeklyPoint[]>([]);

  useEffect(() => {
    async function load() {
      // const data = await api.weeklyWinrate();
      const data = mockWeeklyWinrateData;
      setPoints(data?.points ?? []);
      console.log(data);
    };
    load();
  }, []);

  const normalized = Array.from({ length: 7 }, (_, i) => {
    return points.find((p) => p.dayIndex === i + 1)?.winrate ?? 0;
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: {
          min: 0,
          max: 100,
        },
    },
    plugins: {
        legend: {
            position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Progression de votre winrate dans la semaine',
        },
      },
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'WinRate (%)',
        data: normalized,
        backgroundColor: 'oklch(70.2% 0.183 293.541)',
      },
    ],
  };

  return (
    <section className="grid-style row-span-2 col-span-2 flex flex-col">
      <div className="border rounded-md m-2 p-1 flex-1">
        <Bar options={options} data={data} />
      </div>
    </section>
  );
}