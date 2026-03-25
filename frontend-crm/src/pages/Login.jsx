import React from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import {
    UserOutlined,
    LockOutlined,
    ShopOutlined,
    ArrowRightOutlined,
} from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

export default function Login() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const res = await axiosClient.post("/auth/login", {
                username: values.username,
                password: values.password,
            });
            // Backend trả về { success: true, token: "..." }
            localStorage.setItem("token", res.data.token);
            message.success("Đăng nhập thành công!");
            navigate("/");
        } catch (err) {
            // Axios ném lỗi khi status 4xx/5xx
            const msg = err.response?.data?.message || "Đăng nhập thất bại";
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#020617", // Nền đậm hơn để tăng chiều sâu
                fontFamily: "'Be Vietnam Pro', sans-serif",
                position: "relative",
                overflow: "hidden",
                padding: "20px",
            }}
        >
            {/* Ambient Background Lights */}
            <div
                style={{
                    position: "absolute",
                    width: "800px",
                    height: "800px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
                    top: "-10%",
                    left: "-10%",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: "600px",
                    height: "600px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)",
                    bottom: "-10%",
                    right: "-5%",
                    pointerEvents: "none",
                }}
            />

            {/* Main Auth Container */}
            <div
                style={{
                    display: "flex",
                    width: "100%",
                    maxWidth: "1100px",
                    minHeight: "650px",
                    background: "rgba(15, 23, 42, 0.6)",
                    borderRadius: "32px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(40px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    overflow: "hidden",
                    zIndex: 1,
                }}
                className="auth-container"
            >
                {/* Left side: Branding & Visuals */}
                <div
                    style={{
                        flex: 1,
                        padding: "60px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
                        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                    className="brand-section"
                >
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 80 }}>
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 14,
                                    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 8px 16px rgba(245, 158, 11, 0.2)",
                                }}
                            >
                                <ShopOutlined style={{ color: "#fff", fontSize: 24 }} />
                            </div>
                            <span style={{ color: "#f8fafc", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>
                                Nội Thất Việt
                            </span>
                        </div>

                        <div style={{ maxWidth: "400px" }}>
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    background: "rgba(245, 158, 11, 0.1)",
                                    border: "1px solid rgba(245, 158, 11, 0.2)",
                                    borderRadius: "100px",
                                    padding: "6px 16px",
                                    color: "#f59e0b",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    marginBottom: "24px",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                }}
                            >
                                <span style={{ width: 6, height: 6, background: "#f59e0b", borderRadius: "50%" }} />
                                Hệ thống quản lý v2.0
                            </div>
                            <h1 style={{ color: "#f8fafc", fontSize: "42px", fontWeight: 800, lineHeight: 1.2, margin: "0 0 24px" }}>
                                Quản lý bán hàng
                                <br />
                                <span style={{ background: "linear-gradient(135deg, #fbbf24, #f87171)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    thông minh hơn.
                                </span>
                            </h1>
                            <p style={{ color: "#94a3b8", fontSize: "16px", lineHeight: "1.6", margin: 0 }}>
                                Nền tảng chuyên biệt cho ngành nội thất, giúp tối ưu hóa quy trình từ kho bãi đến chăm sóc khách hàng.
                            </p>
                        </div>
                    </div>

                    {/* Simple Stats Grid */}
                    <div style={{ display: "flex", gap: "40px" }}>
                        <div>
                            <div style={{ color: "#f8fafc", fontSize: "24px", fontWeight: 800 }}>120+</div>
                            <div style={{ color: "#64748b", fontSize: "13px" }}>Đối tác</div>
                        </div>
                        <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", height: "40px" }} />
                        <div>
                            <div style={{ color: "#f8fafc", fontSize: "24px", fontWeight: 800 }}>500M+</div>
                            <div style={{ color: "#64748b", fontSize: "13px" }}>Giao dịch</div>
                        </div>
                    </div>
                </div>

                {/* Right side: Login Form */}
                <div
                    style={{
                        width: "450px",
                        padding: "60px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        background: "rgba(0,0,0,0.1)",
                    }}
                    className="form-section"
                >
                    <div style={{ marginBottom: "40px" }}>
                        <h2 style={{ color: "#f8fafc", fontSize: "28px", fontWeight: 700, margin: "0 0 8px" }}>
                            Đăng nhập
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "15px", margin: 0 }}>
                            Truy cập vào trang quản trị của bạn
                        </p>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleLogin}
                        requiredMark={false}
                    >
                        <Form.Item
                            name="username"
                            label={<span style={{ color: "#94a3b8", fontSize: "13px" }}>Tên đăng nhập</span>}
                            rules={[{ required: true, message: "Nhập tên đăng nhập" }]}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: "#64748b" }} />}
                                placeholder="admin"
                                className="custom-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={<span style={{ color: "#94a3b8", fontSize: "13px" }}>Mật khẩu</span>}
                            rules={[{ required: true, message: "Nhập mật khẩu" }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: "#64748b" }} />}
                                placeholder="••••••••"
                                className="custom-input"
                            />
                        </Form.Item>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
                            <Checkbox style={{ color: "#64748b", fontSize: "13px" }}>Lưu phiên</Checkbox>
                            <a href="#" style={{ color: "#f59e0b", fontSize: "13px", fontWeight: 500 }}>Quên mật khẩu?</a>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            icon={<ArrowRightOutlined />}
                            iconPosition="end"
                            style={{
                                height: "52px",
                                borderRadius: "12px",
                                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                                border: "none",
                                fontSize: "16px",
                                fontWeight: 700,
                                boxShadow: "0 10px 20px -5px rgba(245, 158, 11, 0.4)",
                            }}
                        >
                            Vào hệ thống
                        </Button>
                    </Form>

                    <div style={{
                        marginTop: "32px",
                        textAlign: "center",
                        padding: "12px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)"
                    }}>
                        <span style={{ color: "#475569", fontSize: "13px" }}>
                            Chưa có tài khoản? <a href="#" style={{ color: "#f59e0b", fontWeight: 600 }}>Liên hệ Admin</a>
                        </span>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
                
                .custom-input {
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    height: 50px !important;
                    color: #f8fafc !important;
                }
                .custom-input:focus, .custom-input:hover {
                    border-color: #f59e0b !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                }
                .custom-input input {
                    background: transparent !important;
                    color: #f8fafc !important;
                }
                .ant-input-password-icon { color: #64748b !important; }
                .ant-checkbox-inner { background: transparent !important; border-color: rgba(255,255,255,0.2) !important; }
                .ant-checkbox-checked .ant-checkbox-inner { background: #f59e0b !important; border-color: #f59e0b !important; }
                
                @media (max-width: 992px) {
                    .auth-container { flex-direction: column; max-width: 500px; }
                    .brand-section { display: none; }
                    .form-section { width: 100%; padding: 40px; }
                }
            `}</style>
        </div>
    );
}