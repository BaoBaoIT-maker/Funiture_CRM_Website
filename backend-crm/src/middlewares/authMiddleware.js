import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // 1. Lấy token từ Header do Frontend gửi lên
    const authHeader = req.header('Authorization');
    
    // Nếu không có header hoặc không bắt đầu bằng chữ "Bearer " -> Đuổi về
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Truy cập bị từ chối! Vui lòng đăng nhập." });
    }

    // 2. Tách lấy cái chuỗi token thật sự (cắt bỏ chữ "Bearer " đi)
    const token = authHeader.split(' ')[1];

    try {
        // 3. Dùng "chìa khóa" trong file .env để giải mã xem token có chuẩn không
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Nếu chuẩn, lưu thông tin user vào req và cho phép đi tiếp vào Controller (gọi next)
        req.user = verified; 
        next(); 
    } catch (error) {
        res.status(403).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};