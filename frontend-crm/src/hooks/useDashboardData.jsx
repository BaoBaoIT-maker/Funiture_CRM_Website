import React, { useState, useEffect, useMemo } from "react";
import {
    UserOutlined,
    RiseOutlined,
    ShoppingCartOutlined,
    FireOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

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

export const statusColors = {
    "Mới hỏi": "blue",
    "Đang tư vấn": "orange",
    "Đã chốt": "green",
    "Đã thanh toán": "cyan",
};

export default function useDashboardData() {
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
                    const itemsInOrder = (customer.items || []).reduce(
                        (sum, item) => sum + (item.quantity || 1),
                        0
                    );

                    return totalProducts + itemsInOrder;
                }
                return totalProducts;
            }, 0);
        };

        // Totals (tháng hiện tại)
        const totalCustomers = customersData.length;
        const totalRevenue = customersData
            .filter((c) => c.status === "Đã thanh toán")
            .reduce((s, c) => s + (c.totalAmount || 0), 0);
        const totalProductsSold = productsData.reduce((s, p) => s + (p.soldCount || 0), 0);

        // Pending orders: chỉ tính những khách chưa thanh toán (còn đang xử lý)
        const pendingOrdersCount = customersData.filter(
            (c) =>
                c.status === "Mới hỏi" ||
                c.status === "Đang tư vấn" ||
                c.status === "Đã chốt"
        ).length;

        // Tính so với tháng trước
        const thisMonthRevenue = getMonthRevenue(0);
        const lastMonthRevenue = getMonthRevenue(1);
        const revenueChange =
            lastMonthRevenue > 0
                ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
                : thisMonthRevenue > 0
                    ? 100
                    : 0;

        const thisMonthCustomers = getMonthCustomerCount(0);
        const lastMonthCustomers = getMonthCustomerCount(1);
        const customersChange =
            lastMonthCustomers > 0
                ? Math.round(((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100)
                : thisMonthCustomers > 0
                    ? 100
                    : 0;

        const thisMonthProductsSold = getMonthProductsSold(0);
        const lastMonthProductsSold = getMonthProductsSold(1);
        const productsSoldChange =
            lastMonthProductsSold > 0
                ? Math.round(
                    ((thisMonthProductsSold - lastMonthProductsSold) / lastMonthProductsSold) * 100
                )
                : thisMonthProductsSold > 0
                    ? 100
                    : 0;

        // Pending orders: tính số tác vụ chờ xử lý trong tháng này vs tháng trước
        const thisMonthPending = customersData.filter((c) => {
            const created = c.createdAt ? new Date(c.createdAt) : null;
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            if (!created) return false;
            if (created.getFullYear() !== year || created.getMonth() + 1 !== month) return false;
            return c.status === "Mới hỏi" || c.status === "Đang tư vấn";
        }).length;

        const lastMonthPending = customersData.filter((c) => {
            const created = c.createdAt ? new Date(c.createdAt) : null;
            const d = new Date();
            d.setMonth(d.getMonth() - 1);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            if (!created) return false;
            if (created.getFullYear() !== year || created.getMonth() + 1 !== month) return false;
            return c.status === "Mới hỏi" || c.status === "Đang tư vấn";
        }).length;

        const pendingChange =
            lastMonthPending > 0
                ? Math.round(((thisMonthPending - lastMonthPending) / lastMonthPending) * 100)
                : thisMonthPending > 0
                    ? 100
                    : 0;

        // Stats cards with real numbers
        const derivedStatsCards = statsCards.map((card) => {
            if (card.title === "Tổng khách hàng") {
                return {
                    ...card,
                    value: totalCustomers || card.value,
                    change: `${customersChange >= 0 ? "+" : ""}${customersChange}%`,
                    positive: customersChange >= 0,
                };
            }
            if (card.title === "Tổng doanh thu") {
                return {
                    ...card,
                    value: totalRevenue ? totalRevenue.toLocaleString() : card.value,
                    unit: "VNĐ",
                    change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
                    positive: revenueChange >= 0,
                };
            }
            if (card.title === "Sản phẩm đã bán") {
                return {
                    ...card,
                    value: totalProductsSold || card.value,
                    change: `${productsSoldChange >= 0 ? "+" : ""}${productsSoldChange}%`,
                    positive: productsSoldChange >= 0,
                };
            }
            if (card.title === "Đơn chờ xử lý") {
                return {
                    ...card,
                    value: pendingOrdersCount || card.value,
                    change: `${pendingChange >= 0 ? "+" : ""}${pendingChange}%`,
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
                .filter((c) => c.status === "Đã thanh toán")
                .reduce((s, c) => {
                    const created = c.createdAt ? new Date(c.createdAt) : null;
                    if (!created) return s;
                    if (created.getFullYear() === m.year && created.getMonth() + 1 === m.month) {
                        return s + (c.totalAmount || 0);
                    }
                    return s;
                }, 0);
            return {
                month: label,
                revenue: Math.round(sum / 1000000),
                target: Math.max(50, Math.round((sum / 1000000) * 0.9)),
            };
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

    return { derived, loading, error };
}