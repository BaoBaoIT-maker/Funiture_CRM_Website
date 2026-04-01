import * as customerService from '../services/customerService.js';

const badRequestErrors = new Set([
    'Trạng thái khách hàng không hợp lệ',
    'Sản phẩm không hợp lệ',
    'Số lượng phải lớn hơn 0',
    'Giá chốt không hợp lệ',
    'Có sản phẩm không tồn tại trong hệ thống',
    'Email đã tồn tại',
]);

const getErrorStatusCode = (message) => {
    if (message === 'Không tìm thấy khách hàng') return 404;
    if (badRequestErrors.has(message)) return 400;
    return 500;
};

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await customerService.fetchAllCustomers();
        res.status(200).json({ success: true, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const newCustomer = await customerService.createNewCustomer(req.body);
        res.status(201).json({ success: true, data: newCustomer });
    } catch (error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json({ success: false, message: statusCode === 400 ? error.message : "Lỗi Server", error: error.message });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const customer = await customerService.fetchCustomerById(req.params.id);
        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await customerService.updateCustomerDetail(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Cập nhật khách hàng thành công!', data: updatedCustomer });
    } catch (error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

export const updateCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedCustomer = await customerService.updateStatusAndProcessOrder(id, status);
        res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updatedCustomer });
    } catch (error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json({ success: false, message: statusCode === 500 ? "Lỗi Server" : error.message, error: error.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        await customerService.removeCustomerById(req.params.id);
        res.status(200).json({ success: true, message: 'Xóa khách hàng thành công!' });
    } catch (error) {
        const statusCode = getErrorStatusCode(error.message);
        res.status(statusCode).json({ success: false, message: statusCode === 500 ? 'Lỗi Server' : error.message });
    }
};