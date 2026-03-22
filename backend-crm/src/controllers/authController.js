import * as authService from '../services/authService.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const token = await authService.authenticateUser(username, password);
        res.status(200).json({ success: true, message: "Đăng nhập thành công!", token });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const registerAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const newUser = await authService.createAdminUser(username, password);
        res.status(201).json({ success: true, message: "Tạo Admin thành công", data: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};