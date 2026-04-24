"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function RiskChart({ data }: { data: any[] }) {
    const lowRisk = data.filter(c => c.riskScore <= 30).length;
    const medRisk = data.filter(c => c.riskScore > 30 && c.riskScore <= 70).length;
    const highRisk = data.filter(c => c.riskScore > 70).length;

    const chartData = [
        { name: 'Low Risk', value: lowRisk, color: '#10b981' }, // emerald-500
        { name: 'Medium Risk', value: medRisk, color: '#f59e0b' }, // amber-500
        { name: 'High Risk', value: highRisk, color: '#ef4444' }, // red-500
    ].filter(item => item.value > 0);

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    );
}