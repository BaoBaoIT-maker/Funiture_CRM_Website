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
        res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

export const updateCustomerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedCustomer = await customerService.updateStatusAndProcessOrder(id, status);
        res.status(200).json({ success: true, message: "Cập nhật thành công!", data: updatedCustomer });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};