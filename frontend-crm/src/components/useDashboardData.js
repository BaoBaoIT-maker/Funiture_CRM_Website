import { useState, useEffect, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { INITIAL_STATS_CARDS, STATUS_COLORS } from "../constants";

export const useDashboardData = () => {
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
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const derived = useMemo(() => {
        // --- Helper: tính toán ---
        const getMonthRevenue = (monthOffset) => {
            const d = new Date();
            d.setMonth(d.getMonth() - monthOffset);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            return customersData.reduce((s, c) => {
                if (c.status !== "Đã thanh toán") return s;
                const created = c.createdAt ? new Date(c.createdAt) : null;
                if (created?.getFullYear() === year && created?.getMonth() + 1 === month) {
                    return s + (c.totalAmount || 0);
                }
                return s;
            }, 0);
        };

        const getMonthCustomerCount = (monthOffset) => {
            const d = new Date();
            d.setMonth(d.getMonth() - monthOffset);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            return customersData.filter((c) => {
                const created = c.createdAt ? new Date(c.createdAt) : null;
                return created?.getFullYear() === year && created?.getMonth() + 1 === month;
            }).length;
        };

        const getMonthProductsSold = (monthOffset) => {
            const d = new Date();
            d.setMonth(d.getMonth() - monthOffset);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            return customersData.reduce((total, customer) => {
                if (customer.status !== "Đã thanh toán" && customer.status !== "Đã chốt") return total;
                const created = customer.createdAt ? new Date(customer.createdAt) : null;
                if (created?.getFullYear() === year && created?.getMonth() + 1 === month) {
                    const itemsInOrder = (customer.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
                    return total + itemsInOrder;
                }
                return total;
            }, 0);
        };

        // --- Totals ---
        const totalCustomers = customersData.length;
        const totalRevenue = customersData.filter(c => c.status === "Đã thanh toán").reduce((s, c) => s + (c.totalAmount || 0), 0);
        const totalProductsSold = productsData.reduce((s, p) => s + (p.soldCount || 0), 0);
        const pendingOrdersCount = customersData.filter(c => ["Mới hỏi", "Đang tư vấn", "Đã chốt"].includes(c.status)).length;

        // --- Percentages ---
        const calcChange = (current, last) => last > 0 ? Math.round(((current - last) / last) * 100) : (current > 0 ? 100 : 0);

        const revenueChange = calcChange(getMonthRevenue(0), getMonthRevenue(1));
        const customersChange = calcChange(getMonthCustomerCount(0), getMonthCustomerCount(1));
        const productsSoldChange = calcChange(getMonthProductsSold(0), getMonthProductsSold(1));

        // Logic Pending Change (Giữ nguyên logic cũ của bạn)
        const getPendingMonth = (offset) => {
            const d = new Date();
            d.setMonth(d.getMonth() - offset);
            return customersData.filter(c => {
                const created = c.createdAt ? new Date(c.createdAt) : null;
                return created?.getFullYear() === d.getFullYear() &&
                    created?.getMonth() === d.getMonth() &&
                    ["Mới hỏi", "Đang tư vấn"].includes(c.status);
            }).length;
        };
        const pendingChange = calcChange(getPendingMonth(0), getPendingMonth(1));

        // --- Derived Objects ---
        const derivedStatsCards = INITIAL_STATS_CARDS.map(card => {
            let val = card.value, change = 0;
            if (card.title === "Tổng khách hàng") { val = totalCustomers; change = customersChange; }
            if (card.title === "Tổng doanh thu") { val = totalRevenue.toLocaleString(); change = revenueChange; }
            if (card.title === "Sản phẩm đã bán") { val = totalProductsSold; change = productsSoldChange; }
            if (card.title === "Đơn chờ xử lý") { val = pendingOrdersCount; change = pendingChange; }
            return { ...card, value: val, change: `${change >= 0 ? '+' : ''}${change}%`, positive: change >= 0 };
        });

        // --- Chart & Table Data ---
        const statusBuckets = { "Mới hỏi": 0, "Đang tư vấn": 0, "Đã chốt": 0, "Đã thanh toán": 0 };
        customersData.forEach(c => { if (statusBuckets[c.status] !== undefined) statusBuckets[c.status]++; });
        const totalS = Object.values(statusBuckets).reduce((a, b) => a + b, 0) || 1;
        const customerStatusChartData = Object.entries(statusBuckets).map(([name, value]) => ({
            name, value: Math.round((value / totalS) * 100), color: STATUS_COLORS[name]
        }));

        const now = new Date();
        const revenueChartData = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const sum = customersData.filter(c => c.status === "Đã thanh toán").reduce((s, c) => {
                const created = new Date(c.createdAt);
                return (created.getFullYear() === d.getFullYear() && created.getMonth() === d.getMonth()) ? s + (c.totalAmount || 0) : s;
            }, 0);
            return { month: `T${d.getMonth() + 1}`, revenue: Math.round(sum / 1000000), target: Math.max(50, Math.round(sum / 1100000)) };
        });

        const topProductsData = [...productsData].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5).map((p, i) => ({
            key: p.id || i, name: p.name, sold: p.soldCount || 0,
            revenue: ((p.soldCount || 0) * (p.basePrice || 0)).toLocaleString(),
            trend: Math.round(((p.soldCount || 0) / Math.max(1, totalProductsSold)) * 100)
        }));

        const recentCustomersData = [...customersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4).map((c, i) => ({
            key: c.id || i, name: c.fullName, phone: c.phone, status: c.status, amount: c.totalAmount ? c.totalAmount.toLocaleString() : "-"
        }));

        return { derivedStatsCards, customerStatusChartData, revenueChartData, topProductsData, recentCustomersData, totalProductsSold };
    }, [customersData, productsData]);

    return { loading, error, ...derived };
};