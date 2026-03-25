import React from "react";
import { Col, Row, Spin, Card } from "antd";

// Import Custom Hook xử lý logic
import useDashboardData from "../hooks/useDashboardData.jsx";

// Import các UI Component đã tách
import StatCards from "../components/Dashboard/StatCards";
import RevenueChart from "../components/Dashboard/RevenueChart";
import CustomerStatusChart from "../components/Dashboard/CustomerStatusChart";
import TopProductsTable from "../components/Dashboard/TopProductsTable";
import RecentCustomersTable from "../components/Dashboard/RecentCustomersTable";
export default function Dashboard() {
    // 1. Lấy dữ liệu từ Hook (Code cực kỳ ngắn gọn, không còn logic phức tạp ở đây)
    const { derived, loading, error } = useDashboardData();

    // 2. Xử lý trạng thái Loading
    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
                <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
            </div>
        );
    }

    // 3. Xử lý trạng thái Lỗi
    if (error) {
        return (
            <div style={{ padding: 20 }}>
                <Card bordered={false} style={{ borderRadius: 12 }}>
                    <h3 style={{ color: "#ef4444" }}>Không thể tải dữ liệu</h3>
                    <p>{error.message || String(error)}</p>
                </Card>
            </div>
        );
    }

    // 4. Render Layout chính
    return (
        <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            {/* Hàng 1: Các thẻ thống kê tổng quan */}
            <StatCards data={derived.derivedStatsCards} />

            {/* Hàng 2: Biểu đồ doanh thu và Trạng thái khách hàng */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} lg={14}>
                    <RevenueChart data={derived.revenueChartData} />
                </Col>
                <Col xs={24} lg={10}>
                    <CustomerStatusChart data={derived.customerStatusChartData} />
                </Col>
            </Row>

            {/* Hàng 3: Bảng Top sản phẩm và Khách hàng gần đây */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <TopProductsTable data={derived.topProductsData} />
                </Col>
                <Col xs={24} lg={10}>
                    <RecentCustomersTable data={derived.recentCustomersData} />
                </Col>
            </Row>

            {/* Ghi đè CSS cho Ant Design chuẩn form */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                * { font-family: 'Be Vietnam Pro', sans-serif; }
                .ant-table { font-family: 'Be Vietnam Pro', sans-serif; }
                .ant-table-thead > tr > th { 
                    background: #f8fafc !important; 
                    color: #64748b !important; 
                    font-weight: 600 !important; 
                    font-size: 12px !important; 
                }
                .ant-table-tbody > tr:hover > td { 
                    background: #f8fafc !important; 
                }
                .ant-card-head { 
                    border-bottom: 1px solid #f1f5f9 !important; 
                }
            `}</style>
        </div>
    );
}