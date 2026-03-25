import React from "react";
import { Card, Tag } from "antd";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartTooltip,
    ResponsiveContainer,
} from "recharts";

const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
        return (
            <div
                style={{
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 14px",
                }}
            >
                <p style={{ color: "#94a3b8", margin: "0 0 6px", fontSize: 12 }}>{label}</p>
                {payload.map((p) => (
                    <p
                        key={p.name}
                        style={{ color: p.color, margin: "2px 0", fontSize: 13, fontWeight: 600 }}
                    >
                        {p.name === "revenue" ? "Thực tế" : "Mục tiêu"}: {p.value}M
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function RevenueChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <Card
            title={
                <span style={{ fontWeight: 700, color: "#0f172a" }}>Doanh thu theo tháng</span>
            }
            extra={<Tag color="blue">6 tháng gần nhất</Tag>}
            bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        style={{ fontSize: 12, fill: "#94a3b8" }}
                        unit="M"
                    />
                    <RechartTooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}