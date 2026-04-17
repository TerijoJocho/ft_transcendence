import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
        min: 0,
        max: 3000,
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Progression',
    },
  },
};

const labels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const data = {
  labels,
  datasets: [
    {
      label: 'Courbe ELO durant la semaine',
      data: [100, 103, 105, 102, 130, 160, 1340],
      borderColor: 'oklch(81.1% 0.111 293.571)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      tension: 0.5,
    },
  ],
};

export default function EloGraph() {
    return (
        <section className="grid-style col-span-1 md:col-span-2 row-span-2 flex flex-col">
            <div className="border rounded-md m-2 p-1 flex-1">
                    <Line options={options} data={data} />
            </div>
        </section>
    );
}