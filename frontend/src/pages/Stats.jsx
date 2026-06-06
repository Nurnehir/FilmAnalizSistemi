import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import StatCard from '../components/StatCard';
import { getGenreStats, getActivityStats, getRatingStats, getStatsSummary } from '../api/stats';

const COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#9333ea','#db2777'];

const MONTH_SHORT_TR = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
const MONTH_SHORT_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ── Donut chart (SVG) ── */
function DonutChart({ data }) {
  const size = 180;
  const r = 70;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  let offset = 0;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const el = (
      <circle
        key={i}
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={COLORS[i % COLORS.length]}
        strokeWidth={28}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="flex-shrink-0">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={28} className="dark:stroke-gray-700" />
      {slices}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#6b7280" fontSize={11}>toplam</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#111827" fontSize={20} fontWeight="bold" className="dark:fill-white">{total}</text>
    </svg>
  );
}

/* ── Horizontal bar chart (CSS) ── */
function GenreChart({ data, lang }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
              {lang === 'tr' ? d.genre_name_tr : d.genre_name_en}
            </span>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 ml-2">{d.count}</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Rating bar chart (CSS) ── */
function RatingChart({ data, label }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="space-y-3">
      {[...data].reverse().map((d) => (
        <div key={d.rating} className="flex items-center gap-3">
          <span className="text-amber-400 text-sm w-20 flex-shrink-0">{'★'.repeat(d.rating)}{'☆'.repeat(5 - d.rating)}</span>
          <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-700"
              style={{ width: max > 0 ? `${(d.count / max) * 100}%` : '0%' }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Monthly activity bar chart (SVG) ── */
function ActivityChart({ data, lang }) {
  const W = 560, H = 120;
  const PAD = { t: 8, r: 8, b: 28, l: 30 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const max = Math.max(...data.map(d => d.count), 1);
  const barW = innerW / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* y-axis ticks */}
      {[0, Math.ceil(max / 2), max].map((v, i) => {
        const y = PAD.t + innerH - (v / max) * innerH;
        return (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#374151" strokeDasharray="3 3" strokeWidth={0.5} />
            <text x={PAD.l - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#9ca3af">{v}</text>
          </g>
        );
      })}
      {/* bars */}
      {data.map((d, i) => {
        const bh = (d.count / max) * innerH;
        const x  = PAD.l + i * barW + barW * 0.15;
        const bw = barW * 0.7;
        const y  = PAD.t + innerH - bh;
        const [yr, mon] = d.month.split('-');
        const idx = parseInt(mon, 10) - 1;
        const label = lang === 'tr' ? MONTH_SHORT_TR[idx] : MONTH_SHORT_EN[idx];
        return (
          <g key={i}>
            {d.count > 0 && (
              <rect x={x} y={y} width={bw} height={bh} rx={3} fill="#7c3aed" opacity={0.85} />
            )}
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={9} fill="#9ca3af">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Stats() {
  const { t, lang } = useLang();

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
        setGenres(gen.genres.map(g => ({ ...g, value: g.count })));
        setActivity(act.months);
        setRatings(rat.ratings);
      })
      .catch(() => setError(t.error_generic))
      .finally(() => setLoading(false));
  }, []);

  const hasData = summary && (summary.watchlist_count > 0 || summary.recommendation_count > 0);

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
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard icon="🎬" label={t.stats_watched}         value={summary.watched_count}        color="purple" />
              <StatCard icon="⭐" label={t.stats_avg_rating}      value={summary.avg_rating}           color="amber"  suffix="/5" />
              <StatCard icon="🤖" label={t.stats_recommendations} value={summary.recommendation_count} color="blue"   />
              <StatCard icon="📋" label={t.stats_watchlist}       value={summary.watchlist_count}      color="green"  />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Genre distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">{t.stats_genres}</h2>
                {genres.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">{t.stats_no_data}</p>
                ) : (
                  <div className="flex items-start gap-6">
                    <DonutChart data={genres} />
                    <div className="flex-1 min-w-0 pt-2">
                      <GenreChart data={genres} lang={lang} />
                    </div>
                  </div>
                )}
              </div>

              {/* Rating distribution */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">{t.stats_ratings_dist}</h2>
                {ratings.every(r => r.count === 0) ? (
                  <p className="text-sm text-gray-400 text-center py-8">{t.stats_no_data}</p>
                ) : (
                  <RatingChart data={ratings} />
                )}
              </div>
            </div>

            {/* Monthly activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{t.stats_activity}</h2>
              {activity.every(m => m.count === 0) ? (
                <p className="text-sm text-gray-400 text-center py-8">{t.stats_no_data}</p>
              ) : (
                <ActivityChart data={activity} lang={lang} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
