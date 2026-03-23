import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography,
} from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    DeleteOutlined,
    SaveOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const { Text } = Typography;

const STATUS_OPTIONS = [
    "Mới hỏi",
    "Đang tư vấn",
    "Đã báo giá",
    "Đã thanh toán",
    "Cần bảo hành",
];

const BUDGET_OPTIONS = ["Tiêu chuẩn", "Cao cấp"];

const statusTagColor = {
    "Mới hỏi": "blue",
    "Đang tư vấn": "orange",
    "Đã báo giá": "gold",
    "Đã thanh toán": "green",
    "Cần bảo hành": "purple",
};

function toNumber(value) {
    if (typeof value === "number") return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

export default function Customers() {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState();
    const [form] = Form.useForm();

    const orderItems = Form.useWatch("orderItems", form) || [];

    const computedTotal = useMemo(
        () =>
            orderItems.reduce(
                (sum, item) => sum + toNumber(item?.quantity) * toNumber(item?.dealPrice),
                0
            ),
        [orderItems]
    );

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get("/customers");
            setCustomers(res.data?.data || []);
        } catch (error) {
            message.error("Không tải được danh sách khách hàng");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axiosClient.get("/products");
            setProducts(res.data?.data || []);
        } catch (error) {
            message.error("Không tải được danh sách sản phẩm");
        }
    };

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, []);

    const filteredCustomers = useMemo(() => {
        return customers.filter((customer) => {
            const keyword = searchText.trim().toLowerCase();
            const matchSearch =
                !keyword ||
                customer.fullName?.toLowerCase().includes(keyword) ||
                customer.phone?.toLowerCase().includes(keyword);
            const matchStatus = statusFilter ? customer.status === statusFilter : true;
            return matchSearch && matchStatus;
        });
    }, [customers, searchText, statusFilter]);

    const openCreateModal = () => {
        form.resetFields();
        form.setFieldsValue({
            status: "Đang tư vấn",
            orderItems: [{ quantity: 1, dealPrice: 0 }],
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleCreateCustomer = async () => {
        try {
            const values = await form.validateFields();
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

            const res = await axiosClient.post("/customers", payload);
            const createdCustomerId = res.data?.data?.id;
            message.success("Tạo khách hàng thành công");
            closeModal();
            await fetchCustomers();
            if (createdCustomerId) {
                navigate(`/customers/${createdCustomerId}`);
            }
        } catch (error) {
            if (error?.errorFields) return;
            const apiMessage = error?.response?.data?.message;
            message.error(apiMessage || "Không thể tạo khách hàng");
        }
    };

    const columns = [
        {
            title: "Khách hàng",
            dataIndex: "fullName",
            render: (value) => <Text strong>{value}</Text>,
        },
        {
            title: "SĐT",
            dataIndex: "phone",
        },
        {
            title: "Email",
            dataIndex: "email",
            render: (value) => value || "-",
        },
        {
            title: "Ngân sách",
            dataIndex: "budget",
            render: (value) => value || "-",
        },
        {
            title: "Tổng tiền",
            dataIndex: "totalAmount",
            sorter: (a, b) => toNumber(a.totalAmount) - toNumber(b.totalAmount),
            render: (value) => `${toNumber(value).toLocaleString("vi-VN")} đ`,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (value) => <Tag color={statusTagColor[value]}>{value}</Tag>,
        },
        {
            title: "Sản phẩm đã chọn",
            dataIndex: "customerProducts",
            render: (items) => items?.length || 0,
        },
        {
            title: "Chi tiết",
            key: "actions",
            width: 110,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    style={{ color: "#6366f1" }}
                    onClick={() => navigate(`/customers/${record.id}`)}
                >
                    Mở
                </Button>
            ),
        },
    ];

    return (
        <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
            <Card
                bordered={false}
                style={{ borderRadius: 16, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                bodyStyle={{ padding: "16px 20px" }}
            >
                <Row gutter={12} align="middle">
                    <Col flex="auto">
                        <Row gutter={10}>
                            <Col xs={24} sm={12} md={10}>
                                <Input
                                    prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
                                    placeholder="Tìm theo tên hoặc SĐT..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                    style={{ borderRadius: 8 }}
                                />
                            </Col>
                            <Col xs={24} sm={8} md={7}>
                                <Select
                                    placeholder="Lọc theo trạng thái"
                                    allowClear
                                    style={{ width: "100%" }}
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={STATUS_OPTIONS.map((status) => ({
                                        label: status,
                                        value: status,
                                    }))}
                                />
                            </Col>
                        </Row>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={openCreateModal}
                            style={{
                                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                border: "none",
                                borderRadius: 8,
                                fontWeight: 600,
                                height: 38,
                                boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                            }}
                        >
                            Thêm khách hàng
                        </Button>
                    </Col>
                </Row>
            </Card>

            <Card
                bordered={false}
                style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
                <Table
                    loading={loading}
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredCustomers}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                />
            </Card>

            <Modal
                width={980}
                title="Tạo khách hàng và chi tiết đơn hàng"
                open={modalOpen}
                onCancel={closeModal}
                onOk={handleCreateCustomer}
                okText="Lưu khách hàng"
                cancelText="Hủy"
                okButtonProps={{
                    icon: <SaveOutlined />,
                    style: {
                        background: "linear-gradient(135deg, #10b981, #14b8a6)",
                        border: "none",
                    },
                }}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
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
                        <Input.TextArea rows={3} placeholder="Ghi chú nhu cầu của khách" />
                    </Form.Item>

                    <Card size="small" title="Chi tiết sản phẩm khách chọn" style={{ marginBottom: 12 }}>
                        <Form.List name="orderItems">
                            {(fields, { add, remove }) => (
                                <Space direction="vertical" style={{ width: "100%" }} size={10}>
                                    {fields.map((field) => (
                                        <Row gutter={10} key={field.key} align="middle">
                                            <Col xs={24} md={10}>
                                                <Form.Item
                                                    name={[field.name, "productId"]}
                                                    rules={[{ required: true, message: "Chọn sản phẩm" }]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <Select
                                                        showSearch
                                                        placeholder="Chọn sản phẩm"
                                                        options={products.map((product) => ({
                                                            label: `${product.name} (${toNumber(product.basePrice).toLocaleString("vi-VN")} đ)`,
                                                            value: product.id,
                                                        }))}
                                                        optionFilterProp="label"
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={5}>
                                                <Form.Item
                                                    name={[field.name, "quantity"]}
                                                    rules={[{ required: true, message: "SL" }]}
                                                    style={{ marginBottom: 0 }}
                                                >
                                                    <InputNumber min={1} style={{ width: "100%" }} placeholder="SL" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={12} md={7}>
                                                <Form.Item
                                                    name={[field.name, "dealPrice"]}
                                                    rules={[{ required: true, message: "Giá chốt" }]}
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
                                            <Col xs={24} md={2}>
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

                                    <Button type="dashed" onClick={() => add({ quantity: 1, dealPrice: 0 })} icon={<PlusOutlined />}>
                                        Thêm sản phẩm
                                    </Button>
                                </Space>
                            )}
                        </Form.List>
                    </Card>

                    <Card size="small" bordered={false} style={{ background: "#f8fafc" }}>
                        <Row justify="space-between" align="middle">
                            <Text strong>Tổng tiền tạm tính</Text>
                            <Text strong style={{ color: "#ef4444", fontSize: 18 }}>
                                {computedTotal.toLocaleString("vi-VN")} đ
                            </Text>
                        </Row>
                    </Card>
                </Form>
            </Modal>
        </div>
    );
}
