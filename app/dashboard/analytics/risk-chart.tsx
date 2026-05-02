"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function RiskChart({ data }: { data: any[] }) {
    const lowRisk = data.filter(c => c.riskScore <= 30).length;
    const medRisk = data.filter(c => c.riskScore > 30 && c.riskScore <= 70).length;
    const highRisk = data.filter(c => c.riskScore > 70).length;

    const chartData = [
        { name: 'Low Risk', value: lowRisk, color: '#10b981' },
        { name: 'Medium Risk', value: medRisk, color: '#f59e0b' },
        { name: 'High Risk', value: highRisk, color: '#ef4444' },
    ].filter(item => item.value > 0);

    if (chartData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">No completed contracts yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Analyze contracts to see your risk distribution</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius="35%"
                    outerRadius="55%"
                    paddingAngle={5}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        fontSize: '12px',
                        padding: '8px 12px',
                    }}
                    formatter={(value, name, props) => <div style={{ color: '#94a3b8' }}>{value}</div>}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: '12px', color: '#94a3b8' }}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}