'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  data: { date: string; xp: number }[];
}

export default function ProgressChart({ data }: ProgressChartProps) {
  return (
    <div className="bg-white cute-border border-4 border-cute-primary rounded-2xl p-6 cute-shadow">
      <h3 className="text-2xl font-bold text-cute-primary mb-4">Progress Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#FFB6C1" />
          <XAxis dataKey="date" stroke="#FF6B9D" />
          <YAxis stroke="#FF6B9D" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '4px solid #FF6B9D',
              borderRadius: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="xp"
            stroke="#FF6B9D"
            strokeWidth={3}
            dot={{ fill: '#C77DFF', r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

