import { Layout, Menu, Avatar, Dropdown, Badge, Button, Typography } from "antd";
import {
    DashboardOutlined,
    AppstoreOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    SettingOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ShopOutlined,
} from "@ant-design/icons";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const menuItems = [
    {
        key: "/",
        icon: <DashboardOutlined />,
        label: <Link to="/">Tổng quan</Link>,
    },
    {
        key: "/products",
        icon: <AppstoreOutlined />,
        label: <Link to="/products">Sản phẩm</Link>,
    },
    {
        key: "/customers",
        icon: <UserOutlined />,
        label: <Link to="/customers">Khách hàng</Link>,
    },
];

const pageTitles = {
    "/": "Tổng quan",
    "/products": "Quản lý Sản phẩm",
    "/customers": "Quản lý Khách hàng",
};

export default function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const userMenu = {
        items: [
            {
                key: "profile",
                icon: <UserOutlined />,
                label: "Tài khoản",
            },
            {
                key: "settings",
                icon: <SettingOutlined />,
                label: "Cài đặt",
            },
            { type: "divider" },
            {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Đăng xuất",
                danger: true,
                onClick: handleLogout,
            },
        ],
    };

    const siderWidth = collapsed ? 80 : 240;
    const currentTitle = pageTitles[location.pathname] || "CRM Nội Thất";

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* ── Sidebar ── */}
            <Sider
                width={240}
                collapsedWidth={80}
                collapsed={collapsed}
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 100,
                    background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                    boxShadow: "4px 0 24px rgba(0,0,0,0.18)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? "0" : "0 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.07)",
                        gap: 10,
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <ShopOutlined style={{ color: "#fff", fontSize: 18 }} />
                    </div>
                    {!collapsed && (
                        <div>
                            <div
                                style={{
                                    color: "#f1f5f9",
                                    fontWeight: 700,
                                    fontSize: 15,
                                    lineHeight: 1.2,
                                    fontFamily: "'Be Vietnam Pro', sans-serif",
                                    letterSpacing: "-0.3px",
                                }}
                            >
                                Nội Thất Việt
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>CRM System</div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
                    {!collapsed && (
                        <div
                            style={{
                                color: "#475569",
                                fontSize: 10,
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                padding: "8px 12px 4px",
                            }}
                        >
                            Menu chính
                        </div>
                    )}
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        style={{
                            background: "transparent",
                            border: "none",
                        }}
                    />
                </div>

                {/* User info bottom */}
                {!collapsed && (
                    <div
                        style={{
                            padding: "12px 16px",
                            borderTop: "1px solid rgba(255,255,255,0.07)",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <Avatar
                            size={34}
                            style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)", flexShrink: 0 }}
                        >
                            A
                        </Avatar>
                        <div style={{ minWidth: 0 }}>
                            <div
                                style={{
                                    color: "#f1f5f9",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                            >
                                Admin
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>Quản trị viên</div>
                        </div>
                        <LogoutOutlined
                            onClick={handleLogout}
                            style={{ color: "#64748b", cursor: "pointer", marginLeft: "auto" }}
                        />
                    </div>
                )}
            </Sider>

            {/* ── Main area ── */}
            <Layout style={{ marginLeft: siderWidth, transition: "margin 0.2s" }}>
                {/* Header */}
                <Header
                    style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 99,
                        background: "#fff",
                        padding: "0 24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 1px 0 #f0f0f0",
                        height: 64,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ color: "#64748b" }}
                        />
                        <div style={{ lineHeight: "normal" }}>
                            <div
                                style={{
                                    fontWeight: 700,
                                    fontSize: 18,
                                    color: "#0f172a",
                                    lineHeight: 1.3,
                                    fontFamily: "'Be Vietnam Pro', sans-serif",
                                }}
                            >
                                {currentTitle}
                            </div>
                            <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.4 }}>
                                Chào buổi sáng, Admin 👋
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Badge count={3} size="small">
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                shape="circle"
                                style={{ color: "#64748b" }}
                            />
                        </Badge>
                        <Dropdown menu={userMenu} trigger={["click"]} placement="bottomRight">
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: 8,
                                    transition: "background 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <Avatar
                                    size={32}
                                    style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}
                                >
                                    A
                                </Avatar>
                                <Text style={{ fontWeight: 600, color: "#334155", fontSize: 13 }}>
                                    Admin
                                </Text>
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content
                    style={{
                        padding: 24,
                        background: "#f8fafc",
                        minHeight: "calc(100vh - 64px)",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
        .ant-menu-dark .ant-menu-item-selected {
          background: rgba(245,158,11,0.15) !important;
          border-radius: 8px;
        }
        .ant-menu-dark .ant-menu-item-selected a,
        .ant-menu-dark .ant-menu-item-selected .anticon {
          color: #f59e0b !important;
        }
        .ant-menu-dark .ant-menu-item:hover {
          background: rgba(255,255,255,0.05) !important;
          border-radius: 8px;
        }
        .ant-menu-dark .ant-menu-item {
          border-radius: 8px;
          margin: 2px 0;
        }
        * { font-family: 'Be Vietnam Pro', sans-serif; }
      `}</style>
        </Layout>
    );
}