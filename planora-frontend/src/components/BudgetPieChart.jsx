import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

export default function BudgetPieChart({ data }) {
  if (!data || !data.pieData) {
    return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>No chart data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie 
          data={data.pieData} 
          cx="50%" 
          cy="50%" 
          outerRadius={80} 
          dataKey="value"
        >
          {data.pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => `₹${value}`} 
          contentStyle={{ 
            background: '#131A2E', 
            border: '1px solid #232B42', 
            borderRadius: '8px', 
            color: '#F8FAFC' 
          }} 
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
