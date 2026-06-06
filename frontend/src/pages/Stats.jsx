import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/StatCard';
import { getGenreStats, getActivityStats, getRatingStats, getStatsSummary } from '../api/stats';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, BarElement, LineElement, PointElement,
  CategoryScale, LinearScale,
  Filler, Tooltip, Legend,
);

const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#9333ea','#db2777'];

const MONTH_SHORT_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const MONTH_SHORT_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function cd(isDark) {
  return {
    tick:    isDark ? '#9ca3af' : '#6b7280',
    grid:    isDark ? '#374151' : '#e5e7eb',
    tipBg:   isDark ? '#1f2937' : '#ffffff',
    tipText: isDark ? '#f9fafb' : '#111827',
  };
}

function Card({ title, empty, height = 240, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      {empty
        ? <p className="text-sm text-gray-400 text-center py-10">—</p>
        : <div style={{ height }}>{children}</div>
      }
    </div>
  );
}

export default function Stats() {
  const { t, lang } = useLang();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = cd(isDark);

  const [summary,  setSummary]  = useState(null);
  const [genres,   setGenres]   = useState([]);
  const [activity, setActivity] = useState([]);
  const [ratings,  setRatings]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([getStatsSummary(), getGenreStats(), getActivityStats(), getRatingStats()])
      .then(([sum, gen, act, rat]) => {
        setSummary(sum);
        setGenres(gen.genres);
        setActivity(act.months);
        setRatings(rat.ratings);
      })
      .catch(() => setError(t.error_generic))
      .finally(() => setLoading(false));
  }, []);

  const hasData = summary && (summary.watchlist_count > 0 || summary.recommendation_count > 0);
  const filmLabel = lang === 'tr' ? 'film' : 'films';
  const genreNames = genres.map(g => lang === 'tr' ? g.genre_name_tr : g.genre_name_en);

  const tipBase = { backgroundColor: c.tipBg, titleColor: c.tipText, bodyColor: c.tick };

  /* ── 1. Doughnut: tür dağılımı ── */
  const doughnutData = {
    labels: genreNames,
    datasets: [{
      data: genres.map(g => g.count),
      backgroundColor: COLORS,
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const doughnutOptions = {
    responsive: true, cutout: '60%',
    plugins: {
      legend: { position: 'right', labels: { color: c.tick, font: { size: 11 }, boxWidth: 10, padding: 10 } },
      tooltip: { ...tipBase, callbacks: { label: ctx => ` ${ctx.parsed} ${filmLabel}` } },
    },
  };

  /* ── 2. Doughnut: izlendi / izlenecek ── */
  const watched   = summary?.watched_count ?? 0;
  const unwatched = (summary?.watchlist_count ?? 0) - watched;
  const pieData = {
    labels: [t.stats_watched, t.stats_to_watch],
    datasets: [{
      data: [watched, unwatched],
      backgroundColor: ['#059669', isDark ? '#374151' : '#e5e7eb'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: c.tick, font: { size: 12 }, boxWidth: 12, padding: 14 } },
      tooltip: { ...tipBase, callbacks: { label: ctx => ` ${ctx.parsed} ${filmLabel}` } },
    },
  };

  /* ── 4. Yatay Bar: puan dağılımı ── */
  const ratingData = {
    labels: ['★☆☆☆☆','★★☆☆☆','★★★☆☆','★★★★☆','★★★★★'],
    datasets: [{
      label: filmLabel,
      data: ratings.map(r => r.count),
      backgroundColor: '#f59e0b',
      borderRadius: 4,
    }],
  };
  const ratingOptions = {
    indexAxis: 'y', responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { ...tipBase, titleColor: '#f59e0b', callbacks: { label: ctx => ` ${ctx.parsed.x} ${filmLabel}` } },
    },
    scales: {
      x: { ticks: { color: c.tick, precision: 0 }, grid: { color: c.grid }, beginAtZero: true },
      y: { ticks: { color: '#f59e0b', font: { size: 13 } }, grid: { display: false } },
    },
  };

  /* ── 5. Line: aylık aktivite trendi ── */
  const monthLabels = activity.map(m => {
    const idx = parseInt(m.month.split('-')[1], 10) - 1;
    return lang === 'tr' ? MONTH_SHORT_TR[idx] : MONTH_SHORT_EN[idx];
  });
  const lineData = {
    labels: monthLabels,
    datasets: [{
      label: filmLabel,
      data: activity.map(m => m.count),
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,0.12)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#7c3aed',
    }],
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { ...tipBase, callbacks: { label: ctx => ` ${ctx.parsed.y} ${filmLabel}` } },
    },
    scales: {
      x: { ticks: { color: c.tick }, grid: { color: c.grid } },
      y: { ticks: { color: c.tick, precision: 0 }, grid: { color: c.grid }, beginAtZero: true },
    },
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-red-500">{error}</p>
    </div>
  );

  const noGenre    = genres.length === 0;
  const noRating   = ratings.every(r => r.count === 0);
  const noActivity = activity.every(m => m.count === 0);
  const noWatch    = (summary?.watchlist_count ?? 0) === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.stats_title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{t.stats_subtitle}</p>
        </div>

        {!hasData ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-16 text-center">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{t.stats_no_data}</p>
            <Link to="/watchlist" className="inline-block mt-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
              {t.nav_watchlist}
            </Link>
          </div>
        ) : (
          <>
            {/* Özet kartlar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon="🎬" label={t.stats_watched}         value={summary.watched_count}        color="purple" />
              <StatCard icon="⭐" label={t.stats_avg_rating}      value={summary.avg_rating}           color="amber"  suffix="/5" />
              <StatCard icon="🤖" label={t.stats_recommendations} value={summary.recommendation_count} color="blue"   />
              <StatCard icon="📋" label={t.stats_watchlist}       value={summary.watchlist_count}      color="green"  />
            </div>

            {/* Satır 1: Tür Doughnut + İzlendi/İzlenecek */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card title={t.stats_genres_donut} empty={noGenre}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </Card>
              <Card title={t.stats_watched_ratio} empty={noWatch}>
                <Doughnut data={pieData} options={pieOptions} />
              </Card>
            </div>

            {/* Satır 2: Puan Dağılımı + Aylık Aktivite */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title={t.stats_ratings_dist} empty={noRating} height={200}>
                <Bar data={ratingData} options={ratingOptions} />
              </Card>
              <Card title={t.stats_activity_line} empty={noActivity} height={200}>
                <Line data={lineData} options={lineOptions} />
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
