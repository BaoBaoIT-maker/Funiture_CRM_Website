import {
    Table, Button, Space, Tag, Modal, Form, Input, InputNumber,
    Select, Upload, Image, Popconfirm, message, Card, Row, Col,
    Tooltip, Badge, Spin,
} from "antd";
import {
    PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
    UploadOutlined, AppstoreOutlined, UnorderedListOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const { Option } = Select;
const { TextArea } = Input;

const CATEGORIES = ["Ghế sofa", "Bàn", "Tủ", "Giường", "Ghế", "Đèn", "Thảm", "Khác"];

const statusColor = { "Còn hàng": "success", "Hết hàng": "error", "Sắp hết": "warning" };

// ── Component ──────────────────────────────────────────────────
export default function Products() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState(null);
    const [form] = Form.useForm();

    // ── Fetch products from backend ──
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/products');
            if (response.data.success && response.data.data) {
                // Map backend data to frontend format
                const mappedData = response.data.data.map((product) => ({
                    key: product.id,
                    id: product.id,
                    name: product.name,
                    category: product.category || "Khác",
                    price: product.basePrice || 0,
                    sold: product.soldCount || 0,
                    stock: 0,
                    status: product.basePrice > 0 ? "Còn hàng" : "Hết hàng",
                    image: product.imageUrl || "https://via.placeholder.com/48",
                    description: product.description || "",
                }));
                setData(mappedData);
            }
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu sản phẩm");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = data.filter((d) => {
        const matchSearch =
            d.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = filterCategory ? d.category === filterCategory : true;
        return matchSearch && matchCat;
    });

    const openAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await axiosClient.delete(`/products/${id}`);
            if (response.data.success) {
                message.success("Đã xóa sản phẩm");
                fetchProducts();
            }
        } catch (error) {
            message.error("Lỗi khi xóa sản phẩm");
            console.error(error);
        }
    };

    const handleSave = () => {
        form.validateFields().then(async (values) => {
            try {
                if (editingRecord) {
                    // Update product
                    const updatePayload = {
                        name: values.name,
                        category: values.category,
                        basePrice: values.price,
                    };
                    const response = await axiosClient.put(`/products/${editingRecord.id}`, updatePayload);
                    if (response.data.success) {
                        message.success("Cập nhật sản phẩm thành công");
                        fetchProducts();
                    }
                } else {
                    // Create new product
                    const newPayload = {
                        name: values.name,
                        category: values.category,
                        basePrice: values.price,
                        imageUrl: "https://via.placeholder.com/48",
                    };
                    const response = await axiosClient.post('/products', newPayload);
                    if (response.data.success) {
                        message.success("Thêm sản phẩm thành công");
                        fetchProducts();
                    }
                }
                setModalOpen(false);
            } catch (error) {
                message.error("Lỗi khi lưu sản phẩm");
                console.error(error);
            }
        });
    };

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: "name",
            render: (name, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Image
                        src={record.image}
                        width={48}
                        height={48}
                        style={{ borderRadius: 10, objectFit: "cover" }}
                        preview={false}
                        fallback="https://via.placeholder.com/48"
                    />
                    <div>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{name}</div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>{record.category}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Giá gốc",
            dataIndex: "price",
            sorter: (a, b) => a.price - b.price,
            render: (price) => (
                <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: 14 }}>
                    {price.toLocaleString("vi-VN")} ₫
                </span>
            ),
        },
        {
            title: "Tồn kho",
            dataIndex: "stock",
            render: (stock) => (
                <span style={{ fontWeight: 600, color: stock === 0 ? "#ef4444" : "#0f172a" }}>
                    {stock}
                </span>
            ),
        },
        {
            title: "Đã bán",
            dataIndex: "sold",
            sorter: (a, b) => a.sold - b.sold,
            render: (sold) => (
                <Badge count={sold} showZero style={{ backgroundColor: "#6366f1" }} />
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => (
                <Tag color={statusColor[status]}>{status}</Tag>
            ),
        },
        {
            title: "Thao tác",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEdit(record)}
                            style={{ color: "#6366f1" }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa sản phẩm này?"
                        description="Hành động này không thể hoàn tác."
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" icon={<DeleteOutlined />} danger />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Spin spinning={loading}>
            <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                {/* ── Toolbar ── */}
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
                                        placeholder="Tìm kiếm sản phẩm..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{ borderRadius: 8 }}
                                        allowClear
                                    />
                                </Col>
                                <Col xs={24} sm={8} md={7}>
                                    <Select
                                        placeholder="Danh mục"
                                        allowClear
                                        style={{ width: "100%" }}
                                        onChange={setFilterCategory}
                                        suffixIcon={<FilterOutlined />}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <Option key={c} value={c}>{c}</Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={openAdd}
                                style={{
                                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    border: "none",
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    height: 38,
                                    boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
                                }}
                            >
                                Thêm sản phẩm
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* ── Stats row ── */}
                <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                    {[
                        { label: "Tổng sản phẩm", value: data.length, color: "#6366f1" },
                        { label: "Còn hàng", value: data.filter(d => d.status === "Còn hàng").length, color: "#10b981" },
                        { label: "Hết hàng", value: data.filter(d => d.status === "Hết hàng").length, color: "#ef4444" },
                        { label: "Tổng đã bán", value: data.reduce((s, d) => s + d.sold, 0), color: "#f59e0b" },
                    ].map((s) => (
                        <Col xs={12} sm={6} key={s.label}>
                            <Card
                                bordered={false}
                                style={{ borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                                bodyStyle={{ padding: "14px 18px" }}
                            >
                                <div style={{ color: "#94a3b8", fontSize: 12, marginBottom: 4 }}>{s.label}</div>
                                <div style={{ fontWeight: 800, fontSize: 22, color: s.color, letterSpacing: "-0.5px" }}>
                                    {s.value}
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* ── Table ── */}
                <Card
                    bordered={false}
                    style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                >
                    <Table
                        columns={columns}
                        dataSource={filtered}
                        rowKey="key"
                        pagination={{ pageSize: 8, showSizeChanger: false }}
                    />
                </Card>

                {/* ── Add/Edit Modal ── */}
                <Modal
                    title={
                        <div style={{ fontWeight: 700, fontSize: 18, color: "#0f172a" }}>
                            {editingRecord ? "✏️ Chỉnh sửa sản phẩm" : "➕ Thêm sản phẩm mới"}
                        </div>
                    }
                    open={modalOpen}
                    onCancel={() => setModalOpen(false)}
                    onOk={handleSave}
                    okText={editingRecord ? "Cập nhật" : "Thêm mới"}
                    cancelText="Hủy"
                    okButtonProps={{
                        style: {
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            border: "none",
                            fontWeight: 600,
                        },
                    }}
                    width={580}
                    styles={{ header: { borderBottom: "1px solid #f1f5f9" } }}
                >
                    <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="name"
                                    label="Tên sản phẩm"
                                    rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                                >
                                    <Input placeholder="VD: Sofa Da Cao Cấp" style={{ borderRadius: 8 }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="category"
                                    label="Danh mục"
                                    rules={[{ required: true, message: "Chọn danh mục" }]}
                                >
                                    <Select placeholder="Chọn" style={{ borderRadius: 8 }}>
                                        {CATEGORIES.map((c) => <Option key={c} value={c}>{c}</Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="price"
                                    label="Giá gốc (VNĐ)"
                                    rules={[{ required: true, message: "Nhập giá" }]}
                                >
                                    <InputNumber
                                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                        parser={(v) => v?.replace(/,*/g, "")}
                                        style={{ width: "100%", borderRadius: 8 }}
                                        placeholder="15,000,000"
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="stock"
                                    label="Số lượng tồn kho"
                                    rules={[{ required: true, message: "Nhập số lượng" }]}
                                >
                                    <InputNumber
                                        style={{ width: "100%", borderRadius: 8 }}
                                        placeholder="0"
                                        min={0}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="description" label="Mô tả sản phẩm">
                            <TextArea
                                rows={3}
                                placeholder="Mô tả ngắn về sản phẩm..."
                                style={{ borderRadius: 8 }}
                            />
                        </Form.Item>

                        <Form.Item label="Hình ảnh sản phẩm">
                            <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh lên</div>
                                </div>
                            </Upload>
                        </Form.Item>
                    </Form>
                </Modal>

                <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');
            * { font-family: 'Be Vietnam Pro', sans-serif; }
            .ant-table-thead > tr > th { background: #f8fafc !important; color: #64748b !important; font-weight: 600 !important; font-size: 12px !important; }
            .ant-table-tbody > tr:hover > td { background: #f8fafc !important; }
          `}</style>
            </div>
        </Spin>
    );
}