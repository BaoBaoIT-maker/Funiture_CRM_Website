import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Typography,
} from "antd";
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
    "Mới hỏi",
    "Đang tư vấn",
    "Đã báo giá",
    "Đã thanh toán",
    "Cần bảo hành",
];

const BUDGET_OPTIONS = ["Tiêu chuẩn", "Cao cấp"];

function toNumber(value) {
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

export default function CustomerDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [products, setProducts] = useState([]);

    const orderItems = Form.useWatch("orderItems", form) || [];

    const computedTotal = useMemo(
        () =>
            orderItems.reduce(
                (sum, item) => sum + toNumber(item?.quantity) * toNumber(item?.dealPrice),
                0
            ),
        [orderItems]
    );

    const productPriceMap = useMemo(() => {
        return products.reduce((map, product) => {
            map[product.id] = toNumber(product.basePrice);
            return map;
        }, {});
    }, [products]);

    const hasValidOrderItems = useMemo(() => {
        return orderItems.some(
            (item) => Number(item?.productId) > 0 && toNumber(item?.quantity) > 0
        );
    }, [orderItems]);

    const fetchProducts = async () => {
        const productRes = await axiosClient.get("/products");
        setProducts(productRes.data?.data || []);
    };

    const fetchCustomerDetail = async () => {
        try {
            setLoading(true);
            const customerRes = await axiosClient.get(`/customers/${id}`);
            const customer = customerRes.data?.data;
            if (!customer) {
                message.error("Không tìm thấy khách hàng");
                navigate("/customers");
                return;
            }

            form.setFieldsValue({
                fullName: customer.fullName,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                budget: customer.budget,
                status: customer.status,
                notes: customer.notes,
                orderItems:
                    customer.customerProducts?.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        dealPrice: item.dealPrice,
                    })) || [],
            });
        } catch (error) {
            const apiMessage = error?.response?.data?.message;
            message.error(apiMessage || "Không tải được chi tiết khách hàng");
            navigate("/customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([fetchProducts(), fetchCustomerDetail()]);
    }, [id]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (!values.orderItems || values.orderItems.length === 0) {
                message.error("Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng");
                return;
            }

            const payload = {
                fullName: values.fullName,
                phone: values.phone,
                email: values.email,
                address: values.address,
                budget: values.budget,
                status: values.status,
                notes: values.notes,
                products: (values.orderItems || [])
                    .filter((item) => item?.productId)
                    .map((item) => ({
                        productId: Number(item.productId),
                        quantity: toNumber(item.quantity),
                        dealPrice: toNumber(item.dealPrice),
                    })),
            };

            if (payload.products.length === 0) {
                message.error("Vui lòng chọn sản phẩm hợp lệ trước khi lưu");
                return;
            }

            setSaving(true);
            await axiosClient.put(`/customers/${id}`, payload);
            message.success("Lưu thông tin khách hàng thành công");
            await fetchCustomerDetail();
        } catch (error) {
            if (error?.errorFields) return;
            const apiMessage = error?.response?.data?.message;
            message.error(apiMessage || "Không thể lưu thông tin khách hàng");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <Card
                bordered={false}
                style={{ borderRadius: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: "16px 20px" }}
            >
                <Row justify="space-between" align="middle" gutter={[12, 12]}>
                    <Col>
                        <Space direction="vertical" size={0}>
                            <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate("/customers")}>
                                Quay lại danh sách
                            </Button>
                            <Title level={4} style={{ margin: 0 }}>
                                Chi tiết khách hàng #{id}
                            </Title>
                        </Space>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={saving}
                            onClick={handleSave}
                            disabled={!hasValidOrderItems || loading}
                            style={{
                                background: "linear-gradient(135deg, #10b981, #14b8a6)",
                                border: "none",
                                fontWeight: 600,
                            }}
                        >
                            Lưu thay đổi
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Spin spinning={loading}>
                <Form form={form} layout="vertical">
                    <Card
                        title="Thông tin khách hàng"
                        bordered={false}
                        style={{ borderRadius: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    >
                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="fullName"
                                    label="Họ tên"
                                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                                >
                                    <Input placeholder="Nguyễn Văn A" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                                >
                                    <Input placeholder="0901234567" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item name="email" label="Email">
                                    <Input placeholder="khachhang@gmail.com" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item name="address" label="Địa chỉ">
                                    <Input placeholder="Quận 1, TP.HCM" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={12}>
                            <Col xs={24} md={12}>
                                <Form.Item name="budget" label="Ngân sách">
                                    <Select
                                        placeholder="Chọn mức ngân sách"
                                        options={BUDGET_OPTIONS.map((budget) => ({
                                            label: budget,
                                            value: budget,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="status"
                                    label="Trạng thái"
                                    rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                                >
                                    <Select
                                        options={STATUS_OPTIONS.map((status) => ({
                                            label: status,
                                            value: status,
                                        }))}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="notes" label="Ghi chú tư vấn">
                            <Input.TextArea rows={3} placeholder="Nhu cầu, ghi chú bảo hành..." />
                        </Form.Item>
                    </Card>

                    <Card
                        title="Chi tiết món hàng khách chọn"
                        bordered={false}
                        style={{ borderRadius: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    >
                        <Form.List name="orderItems">
                            {(fields, { add, remove }) => (
                                <Space direction="vertical" style={{ width: "100%" }} size={10}>
                                    {fields.map((field) => (
                                        <Row gutter={10} key={field.key} align="middle">
                                            <Col xs={24} md={9}>
                                                <Form.Item
                                                    name={[field.name, "productId"]}
                                                    rules={[{ required: true, message: "Chọn sản phẩm" }]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Select
                                                        showSearch
                                                        placeholder="Chọn sản phẩm"
                                                        onChange={(productId) => {
                                                            const basePrice = productPriceMap[productId] || 0;
                                                            form.setFieldValue(["orderItems", field.name, "dealPrice"], basePrice);
                                                        }}
                                                        options={products.map((product) => ({
                                                            label: `${product.name} (${toNumber(product.basePrice).toLocaleString("vi-VN")} đ)`,
                                                            value: product.id,
                                                        }))}
                                                        optionFilterProp="label"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={4}>
                                                <Form.Item
                                                    name={[field.name, "quantity"]}
                                                    rules={[
                                                        { required: true, message: "SL" },
                                                        {
                                                            validator: (_, value) =>
                                                                toNumber(value) > 0
                                                                    ? Promise.resolve()
                                                                    : Promise.reject(new Error("SL > 0")),
                                                        },
                                                    ]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber min={1} style={{ width: "100%" }} placeholder="SL" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={5}>
                                                <Form.Item
                                                    name={[field.name, "dealPrice"]}
                                                    rules={[
                                                        { required: true, message: "Giá chốt" },
                                                        {
                                                            validator: (_, value) =>
                                                                toNumber(value) >= 0
                                                                    ? Promise.resolve()
                                                                    : Promise.reject(new Error("Giá >= 0")),
                                                        },
                                                    ]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber
                                                        min={0}
                                                        style={{ width: "100%" }}
                                                        placeholder="Giá chốt"
                                                        formatter={(value) =>
                                                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                                                        }
                                                        parser={(value) => value?.replace(/\,/g, "") || "0"}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={16} md={4}>
                                                <div style={{ fontWeight: 600, color: "#0f172a", textAlign: "right" }}>
                                                    {(toNumber(orderItems[field.name]?.quantity) * toNumber(orderItems[field.name]?.dealPrice)).toLocaleString("vi-VN")} đ
                                                </div>
                                            </Col>
                                            <Col xs={8} md={2}>
                                                <Popconfirm
                                                    title="Xóa dòng sản phẩm này?"
                                                    onConfirm={() => remove(field.name)}
                                                    okText="Xóa"
                                                    cancelText="Hủy"
                                                >
                                                    <Button danger icon={<DeleteOutlined />} block />
                                                </Popconfirm>
                                            </Col>
                                        </Row>
                                    ))}

                                    <Button
                                        type="dashed"
                                        onClick={() => add({ quantity: 1, dealPrice: 0 })}
                                        icon={<PlusOutlined />}
                                    >
                                        Thêm sản phẩm
                                    </Button>
                                </Space>
                            )}
                        </Form.List>
                    </Card>

                    <Card
                        size="small"
                        bordered={false}
                        style={{ borderRadius: 16, background: "#f8fafc", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                    >
                        <Row justify="space-between" align="middle">
                            <Text strong>Tổng tiền hóa đơn</Text>
                            <Text strong style={{ color: "#ef4444", fontSize: 18 }}>
                                {computedTotal.toLocaleString("vi-VN")} đ
                            </Text>
                        </Row>
                    </Card>
                </Form>
            </Spin>
        </div>
    );
}
