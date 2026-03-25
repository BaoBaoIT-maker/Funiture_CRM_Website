import React from "react";
import { Card, Table, Avatar, Tag } from "antd";

const statusColors = {
    "Mới hỏi": "blue",
    "Đang tư vấn": "orange",
    "Đã chốt": "green",
    "Đã thanh toán": "cyan",
};

export default function RecentCustomersTable({ data }) {
    const customerColumns = [
        {
            title: "Khách hàng",
            dataIndex: "name",
            render: (name) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={28} style={{ background: "#6366f1", fontSize: 12 }}>
                        {name ? name[0] : "?"}
                    </Avatar>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
                </div>
            ),
        },
        {
            title: "SĐT",
            dataIndex: "phone",
            render: (v) => <span style={{ color: "#64748b", fontSize: 13 }}>{v}</span>
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (s) => <Tag color={statusColors[s]}>{s}</Tag>,
        },
        {
            title: "Giá trị",
            dataIndex: "amount",
            render: (v) => <span style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{v}</span>,
        },
    ];

    return (
        <Card
            title={<span style={{ fontWeight: 700, color: "#0f172a" }}>Khách hàng gần đây</span>}
            extra={
                <a href="/customers" style={{ color: "#6366f1", fontSize: 13 }}>
                    Xem tất cả
                </a>
            }
            bordered={false}
            style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
            <Table
                columns={customerColumns}
                dataSource={data}
                pagination={false}
                size="small"
                rowKey="key"
            />
        </Card>
    );
}