'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown, Music, Heart, Users, DollarSign } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalPlays: number
    totalLikes: number
    totalFollowers: number
    totalRevenue: number
    growthMetrics: {
      playsGrowth: number
      likesGrowth: number
      followersGrowth: number
      revenueGrowth: number
    }
  }
  chartData: {
    plays: { date: string; value: number }[]
    revenue: { date: string; value: number }[]
  }
  topTracks: { id: string; title: string; plays: number; likes: number; revenue: number }[]
  timeframe: string
}

const TIMEFRAMES = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '1y', label: '1 year' },
]

function GrowthBadge({ value }: { value: number }) {
  const isPositive = value >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(value)}%
    </span>
  )
}

function MiniBarChart({ data, formatValue }: { data: { date: string; value: number }[]; formatValue: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-0.5 h-24">
      {data.map((point) => (
        <div key={point.date} className="flex-1 group relative">
          <div
            className="bg-purple-500 rounded-t hover:bg-purple-600 transition-colors"
            style={{ height: `${Math.max((point.value / max) * 96, point.value > 0 ? 4 : 1)}px` }}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {point.date}: {formatValue(point.value)}
          </div>
        </div>
      ))}
    </div>
  )
}

export function AnalyticsDashboard({ userId }: { userId?: string }) {
  const [timeframe, setTimeframe] = useState('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ timeframe })
      if (userId) params.set('userId', userId)
      const res = await fetch(`/api/analytics?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Could not load analytics')
        return
      }
      setData(json.analytics)
    } catch {
      setError('Could not load analytics')
    } finally {
      setIsLoading(false)
    }
  }, [timeframe, userId])

  useEffect(() => { fetchAnalytics() }, [fetchAnalytics])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500"
        >
          {TIMEFRAMES.map((tf) => <option key={tf.value} value={tf.value}>{tf.label}</option>)}
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Music className="w-4 h-4" /> Total Plays</div>
              <div className="text-2xl font-bold text-gray-900">{data.overview.totalPlays.toLocaleString()}</div>
              <GrowthBadge value={data.overview.growthMetrics.playsGrowth} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Heart className="w-4 h-4" /> Total Likes</div>
              <div className="text-2xl font-bold text-gray-900">{data.overview.totalLikes.toLocaleString()}</div>
              <GrowthBadge value={data.overview.growthMetrics.likesGrowth} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><Users className="w-4 h-4" /> Followers</div>
              <div className="text-2xl font-bold text-gray-900">{data.overview.totalFollowers.toLocaleString()}</div>
              <GrowthBadge value={data.overview.growthMetrics.followersGrowth} />
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1"><DollarSign className="w-4 h-4" /> Net Revenue</div>
              <div className="text-2xl font-bold text-gray-900">${data.overview.totalRevenue.toFixed(2)}</div>
              <GrowthBadge value={data.overview.growthMetrics.revenueGrowth} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Plays over time</h4>
              {data.chartData.plays.every((p) => p.value === 0) ? (
                <p className="text-sm text-gray-400 h-24 flex items-center justify-center">No plays in this period yet.</p>
              ) : (
                <MiniBarChart data={data.chartData.plays} formatValue={(v) => `${v} plays`} />
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Revenue over time</h4>
              {data.chartData.revenue.every((p) => p.value === 0) ? (
                <p className="text-sm text-gray-400 h-24 flex items-center justify-center">No revenue in this period yet.</p>
              ) : (
                <MiniBarChart data={data.chartData.revenue} formatValue={(v) => `$${v.toFixed(2)}`} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <h4 className="text-sm font-medium text-gray-700 p-5 pb-0">Top Tracks</h4>
            {data.topTracks.length === 0 ? (
              <p className="text-sm text-gray-500 p-5">No tracks yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="p-4 font-medium">Track</th>
                    <th className="p-4 font-medium text-right">Plays</th>
                    <th className="p-4 font-medium text-right">Likes</th>
                    <th className="p-4 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topTracks.map((track) => (
                    <tr key={track.id} className="border-b border-gray-50 last:border-0">
                      <td className="p-4 font-medium text-gray-900">{track.title}</td>
                      <td className="p-4 text-right text-gray-600">{track.plays.toLocaleString()}</td>
                      <td className="p-4 text-right text-gray-600">{track.likes.toLocaleString()}</td>
                      <td className="p-4 text-right text-gray-600">${track.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}
