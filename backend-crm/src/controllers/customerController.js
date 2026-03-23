import * as customerService from '../services/customerService.js';

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
        const statusCode = error.message === 'Trạng thái khách hàng không hợp lệ' ? 400 : 500;
        res.status(statusCode).json({ success: false, message: statusCode === 400 ? error.message : "Lỗi Server", error: error.message });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const customer = await customerService.fetchCustomerById(req.params.id);
        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        const statusCode = error.message === 'Không tìm thấy khách hàng' ? 404 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const updatedCustomer = await customerService.updateCustomerDetail(req.params.id, req.body);
        res.status(200).json({ success: true, message: 'Cập nhật khách hàng thành công!', data: updatedCustomer });
    } catch (error) {
        const statusCode = error.message === 'Không tìm thấy khách hàng' ? 404 : error.message === 'Trạng thái khách hàng không hợp lệ' ? 400 : 500;
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
        const statusCode = error.message === 'Không tìm thấy khách hàng' ? 404 : error.message === 'Trạng thái khách hàng không hợp lệ' ? 400 : 500;
        res.status(statusCode).json({ success: false, message: statusCode === 500 ? "Lỗi Server" : error.message, error: error.message });
    }
};