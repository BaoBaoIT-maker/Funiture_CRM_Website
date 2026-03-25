import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Row, Table, Tag, Progress, Avatar, Spin } from "antd";
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
} from "recharts";
import axiosClient from "../api/axiosClient";

// ── Mock data ──────────────────────────────────────────────────
const statsCards = [
    {
        title: "Tổng khách hàng",
        value: "0",
        unit: "khách",
        change: "+0%",
        positive: true,
        icon: <UserOutlined />,
        color: "#6366f1",
        bg: "linear-gradient(135deg,#6366f1,#8b5cf6)",
    },
    {
        title: "Tổng doanh thu",
        value: "0",
        unit: "VNĐ",
        change: "+0%",
        positive: true,
        icon: <RiseOutlined />,
        color: "#f59e0b",
        bg: "linear-gradient(135deg,#f59e0b,#ef4444)",
    },
    {
        title: "Sản phẩm đã bán",
        value: "0",
        unit: "sản phẩm",
        change: "0%",
        positive: false,
        icon: <ShoppingCartOutlined />,
        color: "#10b981",
        bg: "linear-gradient(135deg,#10b981,#059669)",
    },
    {
        title: "Đơn chờ xử lý",
        value: "18",
        unit: "đơn hàng",
        change: "+0",
        positive: false,
        icon: <FireOutlined />,
        color: "#ef4444",
        bg: "linear-gradient(135deg,#ef4444,#dc2626)",
    },
];

// const customerStatusData = [
//     { name: "Mới hỏi", value: 35, color: "#6366f1" },
//     { name: "Đang tư vấn", value: 28, color: "#f59e0b" },
//     { name: "Đã chốt", value: 22, color: "#10b981" },
//     { name: "Đã thanh toán", value: 15, color: "#3b82f6" },
// ];

// const revenueData = [
//     { month: "T1", revenue: 42, target: 50 },
//     { month: "T2", revenue: 58, target: 50 },
//     { month: "T3", revenue: 45, target: 55 },
//     { month: "T4", revenue: 73, target: 60 },
//     { month: "T5", revenue: 62, target: 65 },
//     { month: "T6", revenue: 89, target: 70 },
// ];

// const topProducts = [
//     { key: 1, name: "Sofa Da Cao Cấp", sold: 42, revenue: "630,000,000", trend: 12 },
//     { key: 2, name: "Bàn Ăn Gỗ Sồi", sold: 38, revenue: "190,000,000", trend: 8 },
//     { key: 3, name: "Tủ Quần Áo 3 Cánh", sold: 31, revenue: "248,000,000", trend: -3 },
//     { key: 4, name: "Giường Ngủ King", sold: 25, revenue: "375,000,000", trend: 5 },
//     { key: 5, name: "Ghế Văn Phòng", sold: 94, revenue: "141,000,000", trend: 22 },
// ];

// const recentCustomers = [
//     { key: 1, name: "Nguyễn Văn An", phone: "0901234567", status: "Đang tư vấn", amount: "25,000,000" },
//     { key: 2, name: "Trần Thị Bình", phone: "0912345678", status: "Đã chốt", amount: "48,000,000" },
//     { key: 3, name: "Lê Văn Cường", phone: "0923456789", status: "Mới hỏi", amount: "-" },
//     { key: 4, name: "Phạm Thị Dung", phone: "0934567890", status: "Đã thanh toán", amount: "72,000,000" },
// ];

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
    // New: loading / error / data states
    const [customersData, setCustomersData] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [custRes, prodRes] = await Promise.all([
                    axiosClient.get("/customers"),
                    axiosClient.get("/products"),
                ]);
                setCustomersData(custRes.data?.data || []);
                setProductsData(prodRes.data?.data || []);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // Derived data memoized for performance
    const derived = useMemo(() => {
        // ─── Helper: tính doanh thu theo tháng ───
        const getMonthRevenue = (monthOffset) => {
            const d = new Date();
            d.setMonth(d.getMonth() - monthOffset);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            return customersData.reduce((s, c) => {
                // Chỉ tính doanh thu từ những khách hàng đã thanh toán
                if (c.status !== "Đã thanh toán") return s;

                const created = c.createdAt ? new Date(c.createdAt) : null;
                if (!created) return s;

                if (created.getFullYear() === year && created.getMonth() + 1 === month) {
                    return s + (c.totalAmount || 0);
                }
                return s;
            }, 0);
        };

        // ─── Helper: tính khách hàng theo tháng ───
        const getMonthCustomerCount = (monthOffset) => {
            const d = new Date();
            d.setMonth(d.getMonth() - monthOffset);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            return customersData.filter((c) => {
                const created = c.createdAt ? new Date(c.createdAt) : null;
                if (!created) return false;
                return created.getFullYear() === year && created.getMonth() + 1 === month;
            }).length;
        };

        // ─── Helper: tính sản phẩm bán theo tháng ───
        const getMonthProductsSold = (monthOffset) => {
            const d = new Date();
            // Lấy mốc thời gian: 0 là tháng này, 1 là tháng trước
            d.setMonth(d.getMonth() - monthOffset);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;

            // Lặp qua danh sách KHÁCH HÀNG / ĐƠN HÀNG thay vì danh sách sản phẩm
            return customersData.reduce((totalProducts, customer) => {
                // Chỉ đếm sản phẩm của những đơn đã chốt hoặc đã thanh toán
                if (customer.status !== "Đã thanh toán" && customer.status !== "Đã chốt") {
                    return totalProducts;
                }

                const created = customer.createdAt ? new Date(customer.createdAt) : null;
                if (!created) return totalProducts;

                // Nếu ngày tạo đơn hàng rơi vào đúng tháng/năm đang cần tính
                if (created.getFullYear() === year && created.getMonth() + 1 === month) {

                    // GIẢ SỬ: backend trả về mảng 'items' chứa các mặt hàng khách mua
                    // Ví dụ: customer.items = [{ id: 1, quantity: 2 }, { id: 3, quantity: 1 }]
                    const itemsInOrder = (customer.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

                    return totalProducts + itemsInOrder;
                }
                return totalProducts;
            }, 0);
        };

        // Totals (tháng hiện tại)
        const totalCustomers = customersData.length;
        const totalRevenue = customersData
            .filter(c => c.status === "Đã thanh toán")
            .reduce((s, c) => s + (c.totalAmount || 0), 0);
        const totalProductsSold = productsData.reduce((s, p) => s + (p.soldCount || 0), 0);
        // Pending orders: chỉ tính những khách chưa thanh toán (còn đang xử lý)
        const pendingOrdersCount = customersData.filter(c => c.status === "Mới hỏi" || c.status === "Đang tư vấn" || c.status === "Đã chốt").length;

        // Tính so với tháng trước
        const thisMonthRevenue = getMonthRevenue(0);
        const lastMonthRevenue = getMonthRevenue(1);
        const revenueChange = lastMonthRevenue > 0
            ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : (thisMonthRevenue > 0 ? 100 : 0)

        const thisMonthCustomers = getMonthCustomerCount(0);
        const lastMonthCustomers = getMonthCustomerCount(1);
        const customersChange = lastMonthCustomers > 0
            ? Math.round(((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100)
            : (thisMonthCustomers > 0 ? 100 : 0);

        const thisMonthProductsSold = getMonthProductsSold(0);
        const lastMonthProductsSold = getMonthProductsSold(1);
        const productsSoldChange = lastMonthProductsSold > 0
            ? Math.round(((thisMonthProductsSold - lastMonthProductsSold) / lastMonthProductsSold) * 100)
            : (thisMonthProductsSold > 0 ? 100 : 0);

        // Pending orders: tính số tác vụ chờ xử lý trong tháng này vs tháng trước
        const thisMonthPending = customersData.filter(c => {
            const created = c.createdAt ? new Date(c.createdAt) : null;
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            if (!created) return false;
            if (created.getFullYear() !== year || created.getMonth() + 1 !== month) return false;
            return c.status === "Mới hỏi" || c.status === "Đang tư vấn";
        }).length;

        const lastMonthPending = customersData.filter(c => {
            const created = c.createdAt ? new Date(c.createdAt) : null;
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            if (!created) return false;
            if (created.getFullYear() !== year || created.getMonth() + 1 !== month) return false;
            return c.status === "Mới hỏi" || c.status === "Đang tư vấn";
        }).length;

        const pendingChange = lastMonthPending > 0
            ? Math.round(((thisMonthPending - lastMonthPending) / lastMonthPending) * 100)
            : (thisMonthPending > 0 ? 100 : 0);

        // Stats cards with real numbers
        const derivedStatsCards = statsCards.map((card) => {
            if (card.title === "Tổng khách hàng") {
                return {
                    ...card,
                    value: totalCustomers || card.value,
                    change: `${customersChange >= 0 ? '+' : ''}${customersChange}%`,
                    positive: customersChange >= 0,
                };
            }
            if (card.title === "Tổng doanh thu") {
                return {
                    ...card,
                    value: totalRevenue ? totalRevenue.toLocaleString() : card.value,
                    unit: "VNĐ",
                    change: `${revenueChange >= 0 ? '+' : ''}${revenueChange}%`,
                    positive: revenueChange >= 0,
                };
            }
            if (card.title === "Sản phẩm đã bán") {
                return {
                    ...card,
                    value: totalProductsSold || card.value,
                    change: `${productsSoldChange >= 0 ? '+' : ''}${productsSoldChange}%`,
                    positive: productsSoldChange >= 0,
                };
            }
            if (card.title === "Đơn chờ xử lý") {
                return {
                    ...card,
                    value: pendingOrdersCount || card.value,
                    change: `${pendingChange >= 0 ? '+' : ''}${pendingChange}%`,
                    positive: pendingChange >= 0,
                };
            }
            return card;
        });

        // Customer status pie data
        const statusBuckets = {
            "Mới hỏi": 0,
            "Đang tư vấn": 0,
            "Đã chốt": 0,
            "Đã thanh toán": 0,
        };
        for (const c of customersData) {
            if (statusBuckets[c.status] !== undefined) statusBuckets[c.status]++;
        }
        const totalStatus = Object.values(statusBuckets).reduce((s, v) => s + v, 0) || 1;
        const customerStatusChartData = Object.entries(statusBuckets).map(([name, value]) => ({
            name,
            value: Math.round((value / totalStatus) * 100),
            color: statusColors[name] || "#94a3b8",
        }));

        // Revenue chart for last 6 months based on createdAt of customers
        const now = new Date();
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
        }
        const revenueChartData = months.map((m) => {
            const label = `T${m.month}`;
            const sum = customersData
                .filter(c => c.status === "Đã thanh toán")
                .reduce((s, c) => {
                    const created = c.createdAt ? new Date(c.createdAt) : null;
                    if (!created) return s;
                    if (created.getFullYear() === m.year && created.getMonth() + 1 === m.month) {
                        return s + (c.totalAmount || 0);
                    }
                    return s;
                }, 0);
            return { month: label, revenue: Math.round(sum / 1000000), target: Math.max(50, Math.round((sum / 1000000) * 0.9)) };
        });

        // Top products
        const topProductsData = (productsData || [])
            .slice()
            .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
            .slice(0, 5)
            .map((p, idx) => ({
                key: p.id || idx,
                name: p.name,
                sold: p.soldCount || 0,
                revenue: ((p.soldCount || 0) * (p.basePrice || 0)).toLocaleString(),
                trend: Math.round(((p.soldCount || 0) / Math.max(1, totalProductsSold)) * 100),
            }));

        // Recent customers (most recent 4)
        const recentCustomersData = (customersData || [])
            .slice()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4)
            .map((c, idx) => ({
                key: c.id || idx,
                name: c.fullName,
                phone: c.phone,
                status: c.status,
                amount: c.totalAmount ? c.totalAmount.toLocaleString() : "-",
            }));

        return {
            derivedStatsCards,
            customerStatusChartData,
            revenueChartData,
            topProductsData,
            recentCustomersData,
        };
    }, [customersData, productsData]);

    // If loading show spinner
    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 20 }}>
                <Card bordered={false} style={{ borderRadius: 12 }}>
                    <h3>Không thể tải dữ liệu</h3>
                    <p>{error.message || String(error)}</p>
                </Card>
            </div>
        );
    }

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
                        {name ? name[0] : "?"}
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

    // total not needed — chart uses derived.customerStatusChartData

    return (
        <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {/* ── Stat Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                {derived.derivedStatsCards.map((card) => (
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
                            <BarChart data={derived.revenueChartData} barGap={4}>
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
                                        data={derived.customerStatusChartData}
                                        dataKey="value"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                    >
                                        {derived.customerStatusChartData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartTooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            <div style={{ flex: 1 }}>
                                {derived.customerStatusChartData.map((d) => (
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
                            dataSource={derived.topProductsData}
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
                            dataSource={derived.recentCustomersData}
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
