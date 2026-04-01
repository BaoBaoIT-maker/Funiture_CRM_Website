import * as productService from '../services/productService.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await productService.fetchAllProducts();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const createProduct = async (req, res) => {
    try {
        const newProduct = await productService.createNewProduct(req.body);
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productService.updateProductById(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await productService.removeProduct(req.params.id);
        res.status(200).json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};