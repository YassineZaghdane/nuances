"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Serie = { semaine: string; montant: number; anneePrecedente: number };

export function SalesChart() {
  const [data, setData] = useState<Serie[]>([]);

  useEffect(() => {
    fetch("/api/stats/ventes")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  if (data.length === 0) return null;

  return (
    <div className="erp-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
      <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.25rem", fontWeight: 600, color: "var(--dark)", marginBottom: "1rem" }}>
        Ventes (8 semaines)
      </h2>
      <div style={{ height: 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="semaine" stroke="#8A7B68" fontSize={12} />
            <YAxis stroke="#8A7B68" fontSize={12} tickFormatter={(v) => `${v} TND`} />
            <Tooltip
              formatter={(value: number) => [`${value} TND`, ""]}
              contentStyle={{ backgroundColor: "#FDFAF5", border: "1px solid rgba(196,150,10,0.2)" }}
            />
            <Legend />
            <Bar dataKey="montant" name="2026" fill="#C4960A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="anneePrecedente" name="2025" fill="#EDE5D4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
