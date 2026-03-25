import React from "react";
import { Card, Col, Row } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

export default function StatCards({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            {data.map((card) => (
                <Col xs={24} sm={12} lg={6} key={card.title}>
                    <Card
                        bordered={false}
                        style={{
                            borderRadius: 16,
                            overflow: "hidden",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div style={{ padding: "20px 24px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            color: "#64748b",
                                            fontSize: 13,
                                            margin: "0 0 6px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {card.title}
                                    </p>
                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 800,
                                            color: "#0f172a",
                                            letterSpacing: "-0.5px",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {card.value}
                                    </div>
                                    <p style={{ color: "#94a3b8", fontSize: 12, margin: "4px 0 0" }}>
                                        {card.unit}
                                    </p>
                                </div>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: card.bg,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        color: "#fff",
                                        flexShrink: 0,
                                    }}
                                >
                                    {card.icon}
                                </div>
                            </div>
                            <div
                                style={{
                                    marginTop: 16,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontWeight: 700,
                                        color: card.positive ? "#10b981" : "#ef4444",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    {card.positive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                    {card.change}
                                </span>
                                <span style={{ color: "#94a3b8", fontSize: 12 }}>
                                    so với tháng trước
                                </span>
                            </div>
                        </div>
                        <div style={{ height: 3, background: card.bg }} />
                    </Card>
                </Col>
            ))}
        </Row>
    );
}