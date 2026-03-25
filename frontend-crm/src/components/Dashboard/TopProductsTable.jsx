import React from "react";
import { Card, Table, Progress } from "antd";
import { FireOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

export default function TopProductsTable({ data }) {
    const productColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            render: (name) => <span style={{ fontWeight: 600, color: "#0f172a" }}>{name}</span>,
        },
        {
            title: "Đã bán",
            dataIndex: "sold",
            render: (v) => (
                <div>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{v}</span>
                    <Progress
                        percent={Math.round((v / 100) * 100)}
                        showInfo={false}
                        size="small"
                        strokeColor="#6366f1"
                        trailColor="#f1f5f9"
                        style={{ margin: 0, width: 80 }}
                    />
                </div>
            ),
        },
        {
            title: "Doanh thu",
            dataIndex: "revenue",
            render: (v) => <span style={{ color: "#64748b", fontSize: 13 }}>{v} VNĐ</span>,
        },
        {
            title: "Xu hướng",
            dataIndex: "trend",
            render: (v) => (
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        color: v >= 0 ? "#10b981" : "#ef4444",
                        fontWeight: 600,
                        fontSize: 13,
                    }}
                >
                    {v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(v)}%
                </span>
            ),
        },
    ];

    return (
        <Card
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FireOutlined style={{ color: "#ef4444" }} />
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>Top sản phẩm bán chạy</span>
                </div>
            }
            bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
            <Table
                columns={productColumns}
                dataSource={data}
                pagination={false}
                size="small"
                rowKey="key"
            />
        </Card>
    );
}