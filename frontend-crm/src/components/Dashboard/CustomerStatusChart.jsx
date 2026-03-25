import React from "react";
import { Card } from "antd";
import { PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer } from "recharts";

const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div
                style={{
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "8px 14px",
                }}
            >
                <p style={{ color: payload[0].payload.color, margin: 0, fontWeight: 600 }}>
                    {payload[0].name}: {payload[0].value}%
                </p>
            </div>
        );
    }
    return null;
};

export default function CustomerStatusChart({ data }) {
    return (
        <Card
            title={<span style={{ fontWeight: 700, color: "#0f172a" }}>Trạng thái khách hàng</span>}
            bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ResponsiveContainer width="55%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={3}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                            ))}
                        </Pie>
                        <RechartTooltip content={<CustomPieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                <div style={{ flex: 1 }}>
                    {data.map((d) => (
                        <div
                            key={d.name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 10,
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: d.color,
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{ color: "#64748b", fontSize: 12 }}>{d.name}</span>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                                {d.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}