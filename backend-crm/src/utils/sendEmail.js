import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendInvoiceEmail = async (customerData) => {
    try {
        // Tạo bảng danh sách sản phẩm bằng HTML
        let productRows = '';
        customerData.customerProducts.forEach(item => {
            const productName = item.product ? item.product.name : 'Sản phẩm đã xóa';
            productRows += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${productName}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.dealPrice.toLocaleString('vi-VN')} đ</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(item.quantity * item.dealPrice).toLocaleString('vi-VN')} đ</td>
                </tr>
            `;
        });

        const mailOptions = {
            from: `"Nội Thất Cao Cấp" <${process.env.EMAIL_USER}>`,
            to: customerData.email,
            subject: 'Hóa đơn xác nhận thanh toán - Cửa hàng Nội Thất',
            html: `
                <h2>Kính gửi anh/chị ${customerData.fullName},</h2>
                <p>Cảm ơn anh/chị đã tin tưởng và mua sắm tại cửa hàng chúng tôi. Dưới đây là chi tiết hóa đơn của anh/chị:</p>
                <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 8px;">Sản phẩm</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Số lượng</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Đơn giá chốt</th>
                        <th style="border: 1px solid #ddd; padding: 8px;">Thành tiền</th>
                    </tr>
                    ${productRows}
                    <tr>
                        <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Tổng cộng:</td>
                        <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold; color: red;">${customerData.totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                    </tr>
                </table>
                <p>Trân trọng,<br>Đội ngũ Cửa hàng Nội Thất</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Đã gửi email hóa đơn thành công cho ${customerData.email}`);
    } catch (error) {
        console.error('❌ Lỗi gửi email:', error);
    }
};