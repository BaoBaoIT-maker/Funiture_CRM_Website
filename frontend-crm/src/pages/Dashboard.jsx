import { Card, Col, Row, Table, Tag, Progress, Avatar, Tooltip } from "antd";
import {
    UserOutlined,
    RiseOutlined,
    ShoppingCartOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    FireOutlined,
} from "@ant-design/icons";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip as RechartTooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from "recharts";

// ── Mock data ──────────────────────────────────────────────────
const statsCards = [
    {
        title: "Tổng khách hàng",
        value: "120",
        unit: "khách",
        change: "+12%",
        positive: true,
        icon: <UserOutlined />,
        color: "#6366f1",
        bg: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    },
    {
        title: "Tổng doanh thu",
        value: "500,000,000",
        unit: "VNĐ",
        change: "+8.5%",
        positive: true,
        icon: <RiseOutlined />,
        color: "#f59e0b",
        bg: "linear-gradient(135deg,#f59e0b,#ef4444)",
    },
    {
        title: "Sản phẩm đã bán",
        value: "230",
        unit: "sản phẩm",
        change: "-3%",
        positive: false,
        icon: <ShoppingCartOutlined />,
        color: "#10b981",
        bg: "linear-gradient(135deg,#10b981,#059669)",
    },
    {
        title: "Đơn chờ xử lý",
        value: "18",
        unit: "đơn hàng",
        change: "+5",
        positive: false,
        icon: <FireOutlined />,
        color: "#ef4444",
        bg: "linear-gradient(135deg,#ef4444,#dc2626)",
    },
];

const customerStatusData = [
    { name: "Mới hỏi", value: 35, color: "#6366f1" },
    { name: "Đang tư vấn", value: 28, color: "#f59e0b" },
    { name: "Đã chốt", value: 22, color: "#10b981" },
    { name: "Đã thanh toán", value: 15, color: "#3b82f6" },
];

const revenueData = [
    { month: "T1", revenue: 42, target: 50 },
    { month: "T2", revenue: 58, target: 50 },
    { month: "T3", revenue: 45, target: 55 },
    { month: "T4", revenue: 73, target: 60 },
    { month: "T5", revenue: 62, target: 65 },
    { month: "T6", revenue: 89, target: 70 },
];

const topProducts = [
    { key: 1, name: "Sofa Da Cao Cấp", sold: 42, revenue: "630,000,000", trend: 12 },
    { key: 2, name: "Bàn Ăn Gỗ Sồi", sold: 38, revenue: "190,000,000", trend: 8 },
    { key: 3, name: "Tủ Quần Áo 3 Cánh", sold: 31, revenue: "248,000,000", trend: -3 },
    { key: 4, name: "Giường Ngủ King", sold: 25, revenue: "375,000,000", trend: 5 },
    { key: 5, name: "Ghế Văn Phòng", sold: 94, revenue: "141,000,000", trend: 22 },
];

const recentCustomers = [
    { key: 1, name: "Nguyễn Văn An", phone: "0901234567", status: "Đang tư vấn", amount: "25,000,000" },
    { key: 2, name: "Trần Thị Bình", phone: "0912345678", status: "Đã chốt", amount: "48,000,000" },
    { key: 3, name: "Lê Văn Cường", phone: "0923456789", status: "Mới hỏi", amount: "-" },
    { key: 4, name: "Phạm Thị Dung", phone: "0934567890", status: "Đã thanh toán", amount: "72,000,000" },
];

const statusColors = {
    "Mới hỏi": "blue",
    "Đang tư vấn": "orange",
    "Đã chốt": "green",
    "Đã thanh toán": "cyan",
};

// ── Custom Tooltip ─────────────────────────────────────────────
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
                    <p key={p.name} style={{ color: p.color, margin: "2px 0", fontSize: 13, fontWeight: 600 }}>
                        {p.name === "revenue" ? "Thực tế" : "Mục tiêu"}: {p.value}M
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

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

// ── Component ──────────────────────────────────────────────────
export default function Dashboard() {
    const productColumns = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            render: (name) => (
                <span style={{ fontWeight: 600, color: "#0f172a" }}>{name}</span>
            ),
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

    const customerColumns = [
        {
            title: "Khách hàng",
            dataIndex: "name",
            render: (name) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar size={28} style={{ background: "#6366f1", fontSize: 12 }}>
                        {name[0]}
                    </Avatar>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
                </div>
            ),
        },
        { title: "SĐT", dataIndex: "phone", render: (v) => <span style={{ color: "#64748b", fontSize: 13 }}>{v}</span> },
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

    const total = customerStatusData.reduce((s, d) => s + d.value, 0);

    return (
        <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {/* ── Stat Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {statsCards.map((card) => (
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
                                                fontSize: card.unit === "VNĐ" ? 18 : 28,
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
                                    <span style={{ color: "#94a3b8", fontSize: 12 }}>so với tháng trước</span>
                                </div>
                            </div>
                            <div style={{ height: 3, background: card.bg }} />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* ── Charts Row ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {/* Bar chart */}
                <Col xs={24} lg={14}>
                    <Card
                        title={
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>
                Doanh thu theo tháng
              </span>
                        }
                        extra={<Tag color="blue">6 tháng gần nhất</Tag>}
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    >
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={revenueData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} style={{ fontSize: 12, fill: "#94a3b8" }} />
                                <YAxis axisLine={false} tickLine={false} style={{ fontSize: 12, fill: "#94a3b8" }} unit="M" />
                                <RechartTooltip content={<CustomBarTooltip />} />
                                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                {/* Pie chart */}
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>
                Trạng thái khách hàng
              </span>
                        }
                        bordered={false}
                        style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <ResponsiveContainer width="55%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={customerStatusData}
                                        dataKey="value"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                    >
                                        {customerStatusData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartTooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div style={{ flex: 1 }}>
                                {customerStatusData.map((d) => (
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
                </Col>
            </Row>

            {/* ── Tables Row ── */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
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
                            dataSource={topProducts}
                            pagination={false}
                            size="small"
                            rowKey="key"
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <span style={{ fontWeight: 700, color: "#0f172a" }}>Khách hàng gần đây</span>
                        }
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
                            dataSource={recentCustomers}
                            pagination={false}
                            size="small"
                            rowKey="key"
                        />
                    </Card>
                </Col>
            </Row>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Be Vietnam Pro', sans-serif; }
        .ant-table { font-family: 'Be Vietnam Pro', sans-serif; }
        .ant-table-thead > tr > th { background: #f8fafc !important; color: #64748b !important; font-weight: 600 !important; font-size: 12px !important; }
        .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
        .ant-card-head { border-bottom: 1px solid #f1f5f9 !important; }
      `}</style>
        </div>
    );
}