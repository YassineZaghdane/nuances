'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts'

type DataPoint = {
  label: string
  ca: number
  commandes: number
  panierMoyen: number
}

type Periode = 'jour' | 'semaine' | 'mois'
type Metric = 'ca' | 'commandes' | 'panierMoyen'

const PERIODES: { key: Periode; label: string }[] = [
  { key: 'jour',    label: 'Jour' },
  { key: 'semaine', label: 'Semaine' },
  { key: 'mois',    label: 'Mois' },
]

const METRICS: { key: Metric; label: string; color: string; suffix: string }[] = [
  { key: 'ca',          label: 'CA (DT)',       color: '#C4960A', suffix: ' DT' },
  { key: 'commandes',   label: 'Commandes',     color: '#4A7A9B', suffix: '' },
  { key: 'panierMoyen', label: 'Panier moyen',  color: '#2E7D52', suffix: ' DT' },
]

export function StatsChart() {
  const [periode, setPeriode] = useState<Periode>('semaine')
  const [metric, setMetric]   = useState<Metric>('ca')
  const [data, setData]       = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/stats/ventes-periode?periode=${periode}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [periode])

  const activeMetric = METRICS.find(m => m.key === metric)!

  // Totaux pour le résumé
  const totalCA      = data.reduce((s, d) => s + d.ca, 0)
  const totalCmd     = data.reduce((s, d) => s + d.commandes, 0)
  const avgPanier    = totalCmd > 0
    ? data.filter(d => d.commandes > 0).reduce((s, d) => s + d.panierMoyen, 0) /
      data.filter(d => d.commandes > 0).length
    : 0

  return (
    <div style={{
      background: '#FDFAF5', border: '1px solid #EDE5D4',
      borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1.5rem', borderBottom: '1px solid #EDE5D4',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.7rem',
      }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.05rem', color: '#1A1208',
        }}>
          Évolution des ventes
        </span>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Sélecteur de période */}
          <div style={{ display: 'flex', border: '1px solid #EDE5D4', borderRadius: '4px', overflow: 'hidden' }}>
            {PERIODES.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriode(p.key)}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.68rem', letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer', border: 'none',
                  background: periode === p.key ? '#1A1208' : 'transparent',
                  color: periode === p.key ? 'white' : '#8A7B68',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sélecteur de métrique */}
          <div style={{ display: 'flex', border: '1px solid #EDE5D4', borderRadius: '4px', overflow: 'hidden' }}>
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => setMetric(m.key)}
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.68rem', letterSpacing: '0.08em',
                  textTransform: 'uppercase', cursor: 'pointer', border: 'none',
                  background: metric === m.key ? m.color : 'transparent',
                  color: metric === m.key ? 'white' : '#8A7B68',
                  transition: 'all 0.15s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Résumé mini-stats */}
      <div style={{
        display: 'flex', gap: '0', borderBottom: '1px solid #EDE5D4',
      }}>
        {[
          { label: 'CA total', value: `${totalCA.toFixed(0)} DT`, accent: '#C4960A', bg: '#FFF8E6' },
          { label: 'Commandes', value: totalCmd.toString(), accent: '#4A7A9B', bg: '#EEF5FA' },
          { label: 'Panier moyen', value: `${avgPanier.toFixed(0)} DT`, accent: '#2E7D52', bg: '#E4F2EB' },
        ].map((s, i, arr) => (
          <div key={i} style={{
            flex: 1, padding: '0.8rem 1.5rem',
            borderRight: i < arr.length - 1 ? '1px solid #EDE5D4' : 'none',
          }}>
            <div style={{ fontSize: '0.58rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C4B090', marginBottom: '0.3rem' }}>
              {s.label}
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', fontWeight: 300, color: '#1A1208' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ padding: '1.5rem', height: 280 }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4B090', fontSize: '0.8rem' }}>
            Chargement…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE0" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#C4B090" fontSize={11}
                tickLine={false} axisLine={false}
              />
              <YAxis
                stroke="#C4B090" fontSize={11}
                tickLine={false} axisLine={false}
                tickFormatter={v => `${v}${activeMetric.suffix}`}
                width={metric === 'commandes' ? 30 : 60}
              />
              <Tooltip
                formatter={(value: number) => [
                  `${value.toFixed(metric === 'commandes' ? 0 : 0)}${activeMetric.suffix}`,
                  activeMetric.label,
                ]}
                contentStyle={{
                  backgroundColor: '#FDFAF5',
                  border: '1px solid #EDE5D4',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontFamily: 'Jost, sans-serif',
                }}
                cursor={{ fill: 'rgba(196,150,10,0.05)' }}
              />
              <Bar
                dataKey={metric}
                name={activeMetric.label}
                fill={activeMetric.color}
                radius={[3, 3, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
